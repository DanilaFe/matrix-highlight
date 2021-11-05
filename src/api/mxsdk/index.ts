import * as sdk from "matrix-js-sdk";
import {Authentication, ClientSubscriber, Client, Storage} from "../common";
import {Room,Highlight,User} from "../../model";
import {HIGHLIGHT_EVENT_TYPE, HIGHLIGHT_PAGE_EVENT_TYPE, HIGHLIGHT_PAGE_KEY, HIGHLIGHT_HIDE_EVENT_TYPE, HIGHLIGHT_HIDDEN_KEY, HighlightContent} from "../../model/matrix";

class MxsdkClient implements Client {
    private _subscriber: ClientSubscriber | null = null;
    private _emittedRooms: Set<string> = new Set();
    private _emittedEvents: Set<string> = new Set();

    constructor(private _sdkClient: sdk.MatrixClient) {}

    async _setup(): Promise<typeof this> {
        await this._sdkClient.startClient({initialSyncLimit: 100});
        while (!this._sdkClient.isInitialSyncComplete()) {
            await new Promise(resolve => setTimeout(resolve, 1000))
        }
        // During initial sync, we receive events from rooms. That's nice,
        // but if we also process the timelines of rooms we select, we end
        // up double-counting events. So instead, ignore events from initial
        // sync, and process them manually afterwards.
        this._sdkClient.on("Room", (room: sdk.Room) => {
            this._processRoom(room);
        });
        this._sdkClient.on("Room.myMembership", (room: sdk.Room, membership: string) => {
            this._subscriber?.roomMembership?.(room.roomId, membership);
        });
        this._sdkClient.on("event", (event: sdk.MatrixEvent) => {
            this._processEvent(event);
        });
        this._sdkClient.on("RoomMember.membership", (event: sdk.MatrixEvent, member: sdk.RoomMember, oldMembership: string | null) => {
            this._processMember(event.getRoomId(), oldMembership, member);
        });
        for (const room of this._sdkClient.getRooms()) {
            this._processRoom(room);
        }
        return this;
    }

    private _checkRoom(room: sdk.Room): boolean {
        const state = room.getLiveTimeline().getState(sdk.EventTimeline.FORWARDS);
        const event = state.getStateEvents("m.room.create", "");
        if (!(HIGHLIGHT_PAGE_EVENT_TYPE in event.getContent())) { return false; }
        const url = event.getContent()[HIGHLIGHT_PAGE_EVENT_TYPE];
        return url === window.location.href;
    }

    private _processMember(roomId: string, oldMembership: string | null, member: sdk.RoomMember) {
        if (oldMembership === null) {
            this._subscriber?.addUser?.(roomId, new User({
                id: member.userId,
                name: member.name,
                membership: member.membership,
            }));
        } else {
            this._subscriber?.userMembership?.(roomId, member.userId, member.membership);
        }
    }

    private _processRoom(room: sdk.Room) {
        if (!this._checkRoom(room) || this._sdkClient.isRoomEncrypted(room.roomId))
            return;
        this._emitRoom(room);
    }

    private _emitRoom(room: sdk.Room) {
        if (this._emittedRooms.has(room.roomId) || !this._subscriber) {
            return;
        }
        this._subscriber.addRoom?.(new Room({
            id: room.roomId,
            name: room.name,
            membership: room.getMember(this._sdkClient.getUserId())!.membership
        }));
        this._emittedRooms.add(room.roomId);
        for (const event of room.getLiveTimeline().getEvents()) {
            this._processEvent(event);
        }
        for (const member of room.getMembers()) {
            this._processMember(room.roomId, null, member);
        }
    }

    private _processEvent(event: sdk.MatrixEvent) {
        if (!this._emittedRooms.has(event.getRoomId()) || !this._subscriber) return;
        switch (event.getType()) {
            case HIGHLIGHT_EVENT_TYPE:
                let localId = undefined;
                const transactionId = event.getUnsigned().transaction_id;
                if (transactionId) {
                    const number = parseInt(transactionId);
                    if (number !== NaN) localId = number;
                }
                const newHighlight = new Highlight(event.getId(), event.getContent<HighlightContent>())
                this._subscriber.highlight?.(event.getRoomId(), newHighlight, localId);
                return;
            case HIGHLIGHT_HIDE_EVENT_TYPE:
                const key = event.getStateKey();
                if (!key) {
                    return;
                }
                const hidden = !!event.getContent()[HIGHLIGHT_HIDDEN_KEY];
                this._subscriber.setHighlightVisibility?.(event.getRoomId(), key, !hidden);
                return;
        }
    }

    async createRoom(roomName: string, roomUrl: string) {
        const createRoomResult = await this._sdkClient.createRoom({
            name: roomName,
            creation_content: {
                [HIGHLIGHT_PAGE_EVENT_TYPE]: roomUrl
            },
            power_level_content_override: {
                events: { [HIGHLIGHT_HIDE_EVENT_TYPE]: 0 }
            },
        });
        const room = this._sdkClient.getRoom(createRoomResult.room_id);
        this._emitRoom(room);
        return createRoomResult.room_id;
    }

    async joinRoom(roomId: string) {
        await this._sdkClient.joinRoom(roomId);
    }

    async leaveRoom(roomId: string) {
        await this._sdkClient.leave(roomId);
    }

    async inviteUser(roomId: string, userId: string) {
        await this._sdkClient.invite(roomId, userId);
    }

    async sendHighlight(roomId: string, content: HighlightContent, txnId: number) {
        const response = await this._sdkClient.sendEvent(roomId, HIGHLIGHT_EVENT_TYPE, content, txnId.toString());
        return response.event_id;
    }

    async setHighlightVisibility(roomId: string, highlightId: string, visibility: boolean) {
        await this._sdkClient.sendStateEvent(roomId, HIGHLIGHT_HIDE_EVENT_TYPE, { [HIGHLIGHT_HIDDEN_KEY]: !visibility }, highlightId);
    }

    async shutdown(){
        this._sdkClient.stopClient();
    }

    subscribe(subscriber: ClientSubscriber): void {
        this._subscriber = subscriber;
        this._emittedRooms.clear();
        this._emittedEvents.clear();
        for (const room of this._sdkClient.getRooms()) {
            this._processRoom(room);
        }
    }
}

export class MxsdkAuth implements Authentication {
    constructor(private _storage: Storage) {}

    private async _createClient(baseUrl: string, userId?: string, accessToken?: string): Promise<sdk.MatrixClient> {
        return sdk.createClient({ baseUrl, userId, accessToken, });
    }

    async fromSaved() {
        const userId = this._storage.getString("matrixId");
        const accessToken = this._storage.getString("matrixToken");
        if (!userId || !accessToken) return null;

        const server = userId.substring(userId.indexOf(":") + 1);
        const sdkClient = await this._createClient(`https://${server}`, userId, accessToken);
        return new MxsdkClient(sdkClient)._setup();
    }

    async fromBasic(username: string, password: string, homeserver: string) {
        const client = await this._createClient(`https://${homeserver}`);
        const result = await client.loginWithPassword(username, password);
        if (result.errcode) {
            return null;
        }

        this._storage.setString("matrixId", result.user_id);
        this._storage.setString("matrixToken", result.access_token);
        return new MxsdkClient(client)._setup();
    }
}
