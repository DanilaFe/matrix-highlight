import {Page, Highlight, Room, User} from "../../common/model";
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
    | { type: "room-membership", roomId: string, membership: string }
    | { type: "add-user", roomId: string, user: User }
    | { type: "user-membership", roomId: string, userId: string, membership: string }
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
        } else if (event.type === "room-membership") {
            draft.changeRoom(event.roomId, room => room.membership = event.membership);
        } else if (event.type === "add-user") {
            draft.changeRoom(event.roomId, room => room.addUser(event.user));
        } else if (event.type === "user-membership") {
            draft.changeRoom(event.roomId, room => room.changeUser(event.userId, u => u.membership = event.membership));
        }
    });
    let currentRoomId = state.currentRoomId;
    if (!currentRoomId && event.type === "add-room" && event.room.membership === "join") {
        currentRoomId = event.room.id;
    } else if (!currentRoomId && event.type === "room-membership" && event.membership === "join") {
        currentRoomId = event.roomId;
    } else if (event.type === "room-membership" && event.membership === "leave" && event.roomId === currentRoomId) {
        currentRoomId = null;
    } else if (event.type === "switch-room") {
        currentRoomId = event.newId;
    }
    return { page, currentRoomId };
}

export const highlightInitialState = {
    page: new Page({}),
    currentRoomId: null
}
