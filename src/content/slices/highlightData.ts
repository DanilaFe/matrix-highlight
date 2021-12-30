import {Page, Highlight, Room, User, Message} from "../../common/model";
import {ToContentMessage} from "../../common/messages";
import {produce} from "immer";

export type HighlightDataState = {
    currentRoomId: string | null;
    creatingRoom: boolean;
    syncComplete: boolean;
    page: Page;
}

export type HighlightDataEvent = ToContentMessage
    | { type: "local-highlight", roomId: string, highlight: Highlight }
    | { type: "local-message", roomId: string, threadId: string | number, message: Message }
    | { type: "switch-room", newId: string | null }
    | { type: "set-active", id: string | number | null }
    | { type: "create-room" }

export const highlightReducer = (state: HighlightDataState, event: HighlightDataEvent) => {
    return produce(state, draft => {
        switch (event.type) {
            case "highlight":
                draft.page.changeRoom(event.roomId,
                    room => room.addRemoteHighlight(Highlight.fromOther(event.highlight), event.txnId, event.placeAtTop));
                return;
            case "local-highlight":
                draft.page.changeRoom(event.roomId, room => {
                    room.addLocalHighlight(Highlight.fromOther(event.highlight))
                });
                return;
            case "highlight-content":
                draft.page.changeRoom(event.roomId,
                    room => room.changeHighlight(event.highlightId, hl => hl.content = event.highlight));
                return;
            case "add-room":
                draft.page.addRoom(Room.fromOther(event.room));
                if (!state.currentRoomId && event.room.membership === "join") {
                    draft.currentRoomId = event.room.id;
                }
                return;
            case "create-room":
                draft.creatingRoom = true;
                return;
            case "room-created":
                draft.creatingRoom = false;
                return;
            case "room-membership":
                draft.page.changeRoom(event.roomId, room => room.membership = event.membership);
                if (!state.currentRoomId && event.membership === "join") {
                    draft.currentRoomId = event.roomId;
                } else if (event.membership === "leave" && event.roomId === state.currentRoomId) {
                    draft.currentRoomId = null;
                }
                return;
            case "room-name":
                draft.page.changeRoom(event.roomId, room => room.name = event.name);
                return;
            case "add-user":
                draft.page.changeRoom(event.roomId, room => {
                    room.addUser(User.fromOther(event.user))
                });
                return;
            case "user-membership":
                draft.page.changeRoom(event.roomId, room => {
                    room.changeUser(event.userId, u => u.membership = event.membership)
                });
                return;
            case "local-message":
                draft.page.changeRoom(event.roomId, room => {
                    room.changeHighlight(event.threadId, hl => hl.addLocalMessage(Message.fromOther(event.message)))
                });
                return;
            case "thread-message":
                draft.page.changeRoom(event.roomId, room => {
                    room.changeHighlight(event.threadId, hl => hl.addRemoteMessage(Message.fromOther(event.message), event.txnId, event.placeAtTop))
                });
                return;
            case "set-active":
                if (!state.currentRoomId) return;
                draft.page.changeRoom(state.currentRoomId, room => {
                    room.highlights.forEach(hl => hl.active = hl.id === event.id);
                });
                return;
            case "switch-room":
                draft.currentRoomId = event.newId;
                return;
            case "sync-complete":
                draft.syncComplete = true;
                return;
        }
    });
}

export const highlightInitialState = {
    page: new Page({}),
    creatingRoom: false,
    syncComplete: false,
    currentRoomId: null
}
