import * as sdk from "matrix-js-sdk";
import {FromPopupEvent, ToPopupEvent, ToContentEvent, RoomMembership, HIGHLIGHT_PAGE_EVENT_TYPE} from "../common/messages";
import {fetchRequest} from "./fetch-request";
import {processRoom, processMember, processEvent} from "./events";

const LOCALSTORAGE_ID_KEY = "matrixId";
const LOCALSTORAGE_TOKEN_KEY = "matrixToken";

let client: sdk.MatrixClient | null = null;
sdk.request(fetchRequest);

function sendToTab(tab: chrome.tabs.Tab, event: ToContentEvent): Promise<void> {
    return new Promise(resolve => {
        chrome.tabs.sendMessage<ToContentEvent, void>(tab.id!, event, () => {
            resolve();
        });
    });
}

async function broadcastUrl(url: string, event: ToContentEvent | ToContentEvent[]): Promise<void> {
    const tabs = await chrome.tabs.query({ url });
    const events = Array.isArray(event) ? event : [event];
    for (const event of events) {
        for (const tab of tabs) {
            await sendToTab(tab, event);
        }
    }
}

async function broadcastRoom(roomId: string, event: ToContentEvent | ToContentEvent[] | null): Promise<void> {
    const url = checkRoom(client!.getRoom(roomId)!);
    if (!url || !event) return;
    broadcastUrl(url, event);
}

async function emitRoom(client: sdk.MatrixClient, room: sdk.Room): Promise<void> {
    await broadcastRoom(room.roomId, processRoom(client, room));
}

async function emitEvent(event: sdk.MatrixEvent): Promise<void> {
    await broadcastRoom(event.getRoomId(), processEvent(event));
};

async function emitMember(roomId: string, oldMembership: RoomMembership | null, member: sdk.RoomMember): Promise<void>{
    await broadcastRoom(roomId, processMember(roomId, oldMembership, member));
}

function checkRoom(room: sdk.Room): string | undefined {
    const state = room.getLiveTimeline().getState(sdk.EventTimeline.FORWARDS);
    const event = state.getStateEvents("m.room.create", "");
    return event.getContent()[HIGHLIGHT_PAGE_EVENT_TYPE];
}

async function setupClient(newClient: sdk.MatrixClient) {
    client = newClient;
    newClient.on("sync", state => {
        if (state !== "PREPARED") return;
        // During initial sync, we receive events from rooms. That's nice,
        // but if we also process the timelines of rooms we select, we end
        // up double-counting events. So instead, ignore events from initial
        // sync, and process them manually afterwards.
        newClient.on("Room", (room: sdk.Room) => {
            emitRoom(newClient, room);
        });
        newClient.on("Room.myMembership", (room: sdk.Room, membership: string) => {
            broadcastRoom(room.roomId, {
                type: "room-membership",
                roomId: room.roomId,
                membership: membership as RoomMembership
            });
        });
        newClient.on("event", (event: sdk.MatrixEvent) => {
            emitEvent(event);
        });
        newClient.on("RoomMember.membership", (event: sdk.MatrixEvent, member: sdk.RoomMember, oldMembership: RoomMembership | null) => {
            emitMember(event.getRoomId(), oldMembership, member);
        });
        for (const room of newClient.getRooms()) {
            emitRoom(newClient, room);
        }
    });
    await newClient.startClient({initialSyncLimit: 100});
};

chrome.runtime.onInstalled.addListener(async () => {
    const credentials = await chrome.storage.sync.get([LOCALSTORAGE_ID_KEY, LOCALSTORAGE_TOKEN_KEY]);
    const id: string | undefined = credentials[LOCALSTORAGE_ID_KEY];
    const token: string | undefined = credentials[LOCALSTORAGE_TOKEN_KEY];
    if (id && token) {
        const server = id.substring(id.indexOf(":") + 1);
        setupClient(sdk.createClient({
            baseUrl: `https://${server}`,
            userId: id,
            accessToken: token
        }));
    }
});

function sendToPopup(port: chrome.runtime.Port, message: ToPopupEvent) {
    port.postMessage(message);
}

chrome.runtime.onConnect.addListener(port => {
    if (client) {
        const username = client.getUserId();
        const homeserver = client.getHomeserverUrl();
        const name = client.getUser(username).displayName;
        sendToPopup(port, { type: "login-successful", username, homeserver, name });
    } else {
        sendToPopup(port, { type: "login-required" });
    }
    port.onMessage.addListener(async (message: FromPopupEvent) => {
        if (message.type === "attempt-login") {
            const {username, password, homeserver} = message;
            const newClient = sdk.createClient({ baseUrl: `https://${homeserver}` });
            const result = await newClient.loginWithPassword(username, password);
            if (result.errcode) {
                sendToPopup(port, { type: "login-failed" });
                return;
            }

            chrome.storage.sync.set({
                [LOCALSTORAGE_ID_KEY]: result.user_id,
                [LOCALSTORAGE_TOKEN_KEY]: result.access_token
            });
            await setupClient(newClient);
            const name = newClient.getUser(newClient.getUserId()).displayName;
            sendToPopup(port, { type: "login-successful", username, homeserver, name });
        }
    });
});