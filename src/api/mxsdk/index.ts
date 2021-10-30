import * as sdk from "matrix-js-sdk";
import {Authentication, ClientSubscriber, Client, Storage} from "../common";
import {Room,User,Highlight} from "../../model";
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
        this._sdkClient.on("event", (event: sdk.MatrixEvent) => {
            this._processEvent(event);
        });
        for (const room of this._sdkClient.getRooms()) {
            this._processRoom(room);
        }
        return this;
    }

    private _checkRoom(room: sdk.Room): boolean {
        const state = room.getLiveTimeline().getState(sdk.EventTimeline.FORWARDS);
        const event = state.getStateEvents(HIGHLIGHT_PAGE_EVENT_TYPE, "");
        if (!event) { return false; }
        const url = event.getContent()[HIGHLIGHT_PAGE_KEY];
        return url === window.location.href;
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
        }));
        this._emittedRooms.add(room.roomId);
        for (const event of room.getLiveTimeline().getEvents()) {
            this._processEvent(event);
        }
    }

    private _processEvent(event: sdk.MatrixEvent) {
        if (!this._emittedRooms.has(event.getRoomId()) || !this._subscriber) return;
        switch (event.getType()) {
            case HIGHLIGHT_EVENT_TYPE:
                const localId = event.getUnsigned().transaction_id;
                const localIdNumber = (localId && parseInt(localId)) || undefined;
                const newHighlight = new Highlight(event.getId(), event.getContent<HighlightContent>())
                this._subscriber.highlight?.(event.getRoomId(), newHighlight, localIdNumber);
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

    async createRoom(){ return ""; }

    async sendHighlight(roomId: string, content: HighlightContent, txnId: number) {
        const response = await this._sdkClient.sendEvent(roomId, HIGHLIGHT_EVENT_TYPE, content, txnId.toString());
        return response.event_id;
    }

    async setHighlightVisibility(roomId: string, highlightId: string, visibility: boolean) {}

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
