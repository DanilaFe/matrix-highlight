import {Page, Highlight, Room, User, Message} from "../../common/model";
import {ToContentMessage} from "../../common/messages";
import {produce} from "immer";

export type HighlightDataState = {
    currentRoomId: string | null;
    userId: string | null;
    page: Page;
}

export type HighlightDataEvent = ToContentMessage
    | { type: "local-highlight", roomId: string, highlight: Highlight }
    | { type: "local-message", roomId: string, threadId: string | number, message: Message }
    | { type: "switch-room", newId: string | null }
    | { type: "set-active", id: string | number | null }

export const highlightReducer = (state: HighlightDataState, event: HighlightDataEvent) => {
    const page = produce(state.page, draft => {
        if (event.type === "highlight") {
            draft.changeRoom(event.roomId,
                room => room.addRemoteHighlight(Highlight.fromOther(event.highlight), event.txnId));
        } else if (event.type === "local-highlight") {
            draft.changeRoom(event.roomId, room => room.addLocalHighlight(Highlight.fromOther(event.highlight)));
        } else if (event.type === "highlight-visibility") {
            draft.changeRoom(event.roomId,
                room => room.setHighlightVisibility(event.highlightId, event.visibility));
        } else if (event.type === "highlight-content") {
            draft.changeRoom(event.roomId,
                room => room.changeHighlight(event.highlightId, hl => hl.content = event.highlight));
        } else if (event.type === "add-room") {
            draft.addRoom(Room.fromOther(event.room));
        } else if (event.type === "room-membership") {
            draft.changeRoom(event.roomId, room => room.membership = event.membership);
        } else if (event.type === "add-user") {
            draft.changeRoom(event.roomId, room => room.addUser(User.fromOther(event.user)));
        } else if (event.type === "user-membership") {
            draft.changeRoom(event.roomId, room => room.changeUser(event.userId, u => u.membership = event.membership));
        } else if (event.type === "local-message") {
            draft.changeRoom(event.roomId, room => room.changeHighlight(event.threadId, hl => hl.addLocalMessage(event.message)));
        } else if (event.type === "thread-message") {
            draft.changeRoom(event.roomId, room => room.changeHighlight(event.threadId, hl => hl.addRemoteMessage(event.message, event.txnId)));
        } else if (event.type === "set-active") {
            if (!state.currentRoomId) return;
            draft.changeRoom(state.currentRoomId, room => {
                room.highlights.forEach(hl => hl.active = hl.id === event.id);
            });
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

    let userId = state.userId;
    if (event.type === "logged-in") {
        userId = event.userId;
    }

    return { page, currentRoomId, userId };
}

export const highlightInitialState = {
    page: new Page({}),
    userId: null,
    currentRoomId: null
}
