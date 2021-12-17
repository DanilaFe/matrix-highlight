import {Room, User, Highlight, Message, HighlightContent, HIGHLIGHT_EVENT_TYPE, HIGHLIGHT_HIDE_EVENT_TYPE, HIGHLIGHT_HIDDEN_KEY} from "../common/model";
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

function extractTxnId(event: sdk.MatrixEvent): number | undefined {
    let localId = undefined;
    const transactionId = event.getUnsigned().transaction_id;
    if (transactionId) {
        const number = parseInt(transactionId);
        if (!isNaN(number)) localId = number;
    }
    return localId;
}

export function processEvent(event: sdk.MatrixEvent): ToContentMessage | null {
    switch (event.getType()) {
        case HIGHLIGHT_EVENT_TYPE:
            return {
                type: "highlight",
                roomId: event.getRoomId(),
                txnId: extractTxnId(event),
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
        case "m.room.message":
            if (!event.isThreadRelation || event.isThreadRoot) return null;
            return {
                type: "thread-message",
                roomId: event.getRoomId(),
                threadId: event.threadRootId,
                txnId: extractTxnId(event),
                message: new Message({
                    id: event.getId(),
                    plainBody: event.getContent().body,
                    formattedBody: event.getContent().formatted_body,
                    userId: event.getSender(),
                })
            };
        default: return null;
    }
};

export function processReplacedEvent(event: sdk.MatrixEvent): ToContentMessage | null {
    const processedEvent = processEvent(event);
    if (!processedEvent || processedEvent.type !== "highlight") return null;
    return {
        type: "highlight-content",
        roomId: processedEvent.roomId,
        highlightId: processedEvent.highlight.id,
        highlight: processedEvent.highlight.content
    };
}
