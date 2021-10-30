import {Page, Highlight, Room} from "../model";
import {produce} from "immer";

export type HighlightDataState = {
    currentRoomId: string | null;
    page: Page;
}

export type HighlightDataEvent
    = { type: "remote-highlight", roomId: string, highlight: Highlight, txnId: number | undefined }
    | { type: "local-highlight", roomId: string, highlight: Highlight }
    | { type: "change-visibility", roomId: string, highlightId: string | number, visibility: boolean }
    | { type: "add-room", room: Room }
    | { type: "switch-room", newId: string | null }

export const highlightReducer = (state: HighlightDataState, event: HighlightDataEvent) => {
    const page = produce(state.page, draft => {
        if (event.type === "remote-highlight") {
            draft.changeRoom(event.roomId,
                room => room.addRemoteHighlight(event.highlight, event.txnId));
        } else if (event.type === "local-highlight") {
            draft.changeRoom(event.roomId, room => room.addLocalHighlight(event.highlight));
        } else if (event.type === "change-visibility") {
            draft.changeRoom(event.roomId,
                room => room.setHighlightVisibility(event.highlightId, event.visibility));
        } else if (event.type === "add-room") {
            draft.addRoom(event.room);
        }
    });
    let currentRoomId = state.currentRoomId;
    if (!currentRoomId && event.type === "add-room") {
        currentRoomId = event.room.id;
    } else if (event.type === "switch-room") {
        currentRoomId = event.newId;
    }
    return { page, currentRoomId };
}

export const highlightInitialState = {
    page: new Page({}),
    currentRoomId: null
}
