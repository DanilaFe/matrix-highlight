import * as sdk from "matrix-js-sdk";
import {HIGHLIGHT_PAGE_EVENT_TYPE, HIGHLIGHT_HIDE_EVENT_TYPE, HIGHLIGHT_EVENT_TYPE, HIGHLIGHT_HIDDEN_KEY, HighlightContent} from "../common/messages";

export async function createRoom(client: sdk.MatrixClient, name: string, url: string): Promise<sdk.Room> {
    const createRoomResult = await client.createRoom({
        name,
        creation_content: {
            [HIGHLIGHT_PAGE_EVENT_TYPE]: url
        },
        power_level_content_override: {
            events: { [HIGHLIGHT_HIDE_EVENT_TYPE]: 0 }
        },
    });
    return client.getRoom(createRoomResult.room_id);
}

export async function joinRoom(client: sdk.MatrixClient, roomId: string): Promise<void> {
    await client.joinRoom(roomId);
}

export async function leaveRoom(client: sdk.MatrixClient, roomId: string): Promise<void> {
    await client.leave(roomId);
}

export async function inviteUser(client: sdk.MatrixClient, roomId: string, userId: string): Promise<void> {
    await client.invite(roomId, userId);
}

export async function sendHighlight(client: sdk.MatrixClient, roomId: string, content: HighlightContent, txnId: number): Promise<void> {
    await client.sendEvent(roomId, HIGHLIGHT_EVENT_TYPE, content, txnId.toString());
}

export async function sendThreadMessage(client: sdk.MatrixClient, roomId: string, threadId: string, plainBody: string, formattedBody: string, txnId: number): Promise<void> {
    await client.sendEvent(roomId, "m.room.message", {
        "msgtype": "m.text",
        "body": plainBody,
        "formatted_body": formattedBody,
        "m.relates_to": {
            "rel_type": "io.element.thread",
            "event_id": threadId,
        }
    }, txnId.toString());
}

export async function sendHighlightEdit(client: sdk.MatrixClient, roomId: string, highlightId: string, newContent: HighlightContent): Promise<void> {
    await client.sendEvent(roomId, "m.room.message", {
        "msgtype": "m.text",
        "body": "Changed highlight",
        "m.relates_to": {
            "rel_type": "m.replace",
            "event_id": highlightId
        },
        "m.new_content": newContent
    });
}

export async function setHighlightVisibility(client: sdk.MatrixClient, roomId: string, highlightId: string, visibility: boolean): Promise<void> {
    await client.sendStateEvent(roomId, HIGHLIGHT_HIDE_EVENT_TYPE, { [HIGHLIGHT_HIDDEN_KEY]: !visibility }, highlightId);
}

export async function loadRoom(client: sdk.MatrixClient, roomId: string) {
    const room = client.getRoom(roomId);
    if (!room) return;
    const continuePagination = async () => {
        const more = await client.paginateEventTimeline(room.getLiveTimeline(), {backwards: true, limit: 100});
        if (more) await continuePagination();
    }
    await continuePagination();
}

export function checkRoom(room: sdk.Room): string | undefined {
    const state = room.getLiveTimeline().getState(sdk.EventTimeline.FORWARDS);
    const event = state.getStateEvents("m.room.create", "");
    return event.getContent()[HIGHLIGHT_PAGE_EVENT_TYPE];
}
