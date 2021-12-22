import {Room, User, Highlight, Message, HighlightContent, HIGHLIGHT_EVENT_TYPE, HIGHLIGHT_EDIT_REL_TYPE, HIGHLIGHT_NEW_HIGHLIGHT_KEY, HIGHLIGHT_EDIT_EVENT_TYPE, HIGHLIGHT_HIDDEN_KEY} from "../common/model";
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
        const contentEvent = processEvent(client, event);
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

function eventToMessage(event: sdk.MatrixEvent): Message {
    return new Message({
        id: event.getId(),
        plainBody: event.getContent().body,
        formattedBody: event.getContent().formatted_body,
        userId: event.getSender(),
    });
}

function addExistingReplies(client: sdk.MatrixClient, event: sdk.MatrixEvent, highlight: Highlight): void {
    const timelineSet = client.getRoom(event.getRoomId()).getUnfilteredTimelineSet();
    const threadReplies = timelineSet.getRelationsForEvent(event.getId(), sdk.RelationType.Thread, "m.room.message");
    if (!threadReplies) return;
    for (const threadEvent of threadReplies.getRelations().sort((e1, e2) => e1.getTs() - e2.getTs())) {
        highlight.addRemoteMessage(eventToMessage(threadEvent), undefined);
    }
}

function useLatestContent(client: sdk.MatrixClient, event: sdk.MatrixEvent, highlight: Highlight): void {
    const timelineSet = client.getRoom(event.getRoomId()).getUnfilteredTimelineSet();
    const edits = timelineSet.getRelationsForEvent(event.getId(), HIGHLIGHT_EDIT_REL_TYPE as any, HIGHLIGHT_EDIT_EVENT_TYPE);
    if (!edits) return;
    const sortedEdits = edits.getRelations().sort((e1, e2) => e1.getTs() - e2.getTs());
    const lastEdit = sortedEdits[sortedEdits.length - 1]
    highlight.content = lastEdit.getContent()[HIGHLIGHT_NEW_HIGHLIGHT_KEY];
}

export function processEvent(client: sdk.MatrixClient, event: sdk.MatrixEvent, placeAtTop: boolean = false): ToContentMessage | null {
    switch (event.getType()) {
        case HIGHLIGHT_EVENT_TYPE:
            const highlight = new Highlight(event.getId(), event.getContent<HighlightContent>());
            addExistingReplies(client, event, highlight);
            useLatestContent(client, event, highlight);
            return {
                type: "highlight",
                roomId: event.getRoomId(),
                txnId: extractTxnId(event),
                highlight: highlight,
                placeAtTop,
            };
        case HIGHLIGHT_EDIT_EVENT_TYPE:
            const highlightId = event.getRelation()?.["event_id"];
            const newContent = event.getContent()[HIGHLIGHT_NEW_HIGHLIGHT_KEY] as HighlightContent
            if (!highlightId) return null;
            return {
                type: "highlight-content",
                roomId: event.getRoomId(),
                highlightId,
                highlight: newContent
            };
        case "m.room.message":
            if (!event.isThreadRelation || event.isThreadRoot) return null;
            return {
                type: "thread-message",
                roomId: event.getRoomId(),
                threadId: event.threadRootId,
                txnId: extractTxnId(event),
                message: eventToMessage(event),
                placeAtTop,
            };
        default: return null;
    }
};
