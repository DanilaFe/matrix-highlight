import {Room, User, Highlight, HighlightContent, HIGHLIGHT_EVENT_TYPE, HIGHLIGHT_HIDE_EVENT_TYPE, HIGHLIGHT_HIDDEN_KEY} from "../common/model";
import {RoomMembership, ToContentMessage} from "../common/messages";
import * as sdk from "matrix-js-sdk";

export function processRoom(client: sdk.MatrixClient, room: sdk.Room): ToContentMessage[] {
    if (client.isRoomEncrypted(room.roomId)) return [];
    const events: ToContentMessage[] = [];
    events.push({
        type: "add-room",
        room: new Room({
            id: room.roomId,
            name: room.name,
            membership: room.getMember(client.getUserId())!.membership
        })
    });
    for (const event of room.getLiveTimeline().getEvents()) {
        const contentEvent = processEvent(event);
        if (contentEvent) events.push(contentEvent);
    }
    for (const member of room.getMembers()) {
        events.push(processMember(room.roomId, null, member));
    }
    return events;
};

export function processMember(roomId: string, oldMembership: RoomMembership | null, member: sdk.RoomMember): ToContentMessage {
    if (oldMembership === null) {
        const user = new User({
            id: member.userId,
            name: member.name,
            membership: member.membership,
        });
        return { type: "add-user", roomId, user };
    } else {
        return {
            type: "user-membership",
            roomId,
            userId: member.userId,
            membership: member.membership as RoomMembership
        };
    }
};


export function processEvent(event: sdk.MatrixEvent): ToContentMessage | null {
    switch (event.getType()) {
        case HIGHLIGHT_EVENT_TYPE:
            let localId = undefined;
            const transactionId = event.getUnsigned().transaction_id;
            if (transactionId) {
                const number = parseInt(transactionId);
                if (number !== NaN) localId = number;
            }
            return {
                type: "highlight",
                roomId: event.getRoomId(),
                txnId: localId,
                highlight: new Highlight(event.getId(), event.getContent<HighlightContent>())
            };
        case HIGHLIGHT_HIDE_EVENT_TYPE:
            const key = event.getStateKey()!;
            const hidden = !!event.getContent()[HIGHLIGHT_HIDDEN_KEY];
            return {
                type: "highlight-visibility",
                roomId: event.getRoomId(),
                visibility: !hidden,
                highlightId: key,
            };
        default: return null;
    }
};
