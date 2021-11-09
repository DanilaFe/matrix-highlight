export * from "./model";
import {Room, User, Highlight, HighlightContent} from "./model";

export type RoomMembership = "invite" | "join" | "leave" | "ban"

export type ToPopupEvent = {
    type: "login-successful",
    username: string,
    name: string
    homeserver: string,
} | {
    type: "login-failed"
} | {
    type: "login-required"
}

export type FromPopupEvent = {
    type: "attempt-login",
    username: string,
    password: string,
    homeserver: string
}

export type ToContentEvent = {
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
    highlightId: string,
    visibility: boolean,
}

export type FromContentEvent = {
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
}
