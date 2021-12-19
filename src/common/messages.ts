export * from "./model";
import {Room, User, Highlight, HighlightContent, Message} from "./model";

export type RoomMembership = "invite" | "join" | "leave" | "ban"

export const PORT_TAB = "port-tab";
export const PORT_RENEW = "port-renew";
export const PORT_POP = "port-pop";

export type ToPopupMessage = {
    type: "login-successful",
    username: string,
    name: string
    homeserver: string,
} | {
    type: "login-failed"
} | {
    type: "login-required"
}

export type FromPopupMessage = {
    type: "attempt-login",
    username: string,
    password: string,
    homeserver: string
}

export type ToContentMessage = {
    type: "add-room",
    room: Room
} | {
    type: "room-membership",
    roomId: string,
    membership: RoomMembership,
} | {
    type: "add-user",
    roomId: string,
    user: User,
} | {
    type: "user-membership",
    roomId: string,
    userId: string,
    membership: RoomMembership,
} | {
    type: "highlight",
    roomId: string,
    highlight: Highlight,
    txnId: number | undefined,
} | {
    type: "highlight-visibility",
    roomId: string,
    highlightId: number | string,
    visibility: boolean,
} | {
    type: "highlight-content",
    roomId: string,
    highlightId: number | string,
    highlight: HighlightContent
} | {
    type: "thread-message",
    roomId: string,
    threadId: string,
    txnId: number | undefined,
    message: Message
} | {
    type: "logged-in",
    userId: string
} | {
    type: "sync-complete"
}

export type FromContentMessage = {
    type: "create-room",
    name: string,
    url: string,
} | {
    type: "join-room",
    roomId: string,
} | {
    type: "leave-room",
    roomId: string,
} | {
    type: "invite-user",
    roomId: string,
    userId: string
} | {
    type: "send-highlight",
    roomId: string,
    highlight: HighlightContent,
    txnId: number
} | {
    type: "set-highlight-visibility",
    roomId: string,
    highlightId: string,
    visibility: boolean
} | {
    type: "edit-highlight",
    roomId: string,
    highlightId: string,
    highlight: HighlightContent
} | {
    type: "send-thread-message",
    roomId: string,
    threadId: string,
    plainBody: string,
    formattedBody: string,
    txnId: number
}
