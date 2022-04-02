import * as sdk from "matrix-js-sdk";
import {PORT_TAB, PORT_RENEW, FromContentMessage, ToContentMessage, RoomMembership} from "../common/messages";
import {fetchRequest} from "./fetch-request";
import {Client} from "./client";
import * as browser from "webextension-polyfill";
import {Platform} from "./platform";

class WebExtPlatform extends Platform {
    private _hookedTabs: Map<number, browser.Runtime.Port>
    private _triedCachedLogin: boolean = false;

    private _setupTabPort(port: browser.Runtime.Port, initial: boolean) {
        const tab = port.sender?.tab;
        if (!tab?.id || !tab.url) return;
        this._hookedTabs.set(tab.id, port);
        // Catch new page with existing pages
        if (this._client && initial) {
            for (const message of this._client.catchupMessages(tab.url)) {
                port.postMessage(message);
            }
        }
        port.onMessage.addListener(async (message: FromContentMessage) => {
            if (message.type === "attempt-login") {
                const loginResult = await this.tryLogin(message.username, message.password, message.homeserver);
                if ("loginError" in loginResult) {
                    port.postMessage({ type: "login-failed", loginError: loginResult.loginError });
                    return;
                }
                await this.setupClient(loginResult);
            } else if (message.type === "create-room") {
                await this._client!.createRoom(message.name, message.url);
                port.postMessage({ type: "room-created" });
            } else {
                this._client?.handleMessage(message);
            }
        });
    }

    private async _cachedLogin() {
        if(this._triedCachedLogin) return;
        this._triedCachedLogin = true;
        const loginResult = await this.tryCachedLogin();
        if (loginResult) await this.setupClient(loginResult)
    }

    private _hookBrowser() {
        browser.runtime.onConnect.addListener(async port => {
            await this._cachedLogin();
            if (port.name === PORT_TAB || port.name === PORT_RENEW) this._setupTabPort(port, port.name === PORT_TAB);
        });
        browser.runtime.onInstalled.addListener(async () => {
            browser.contextMenus.create({
                title: "Highlight using Matrix",
                contexts: ["page"],
                id: "com.danilafe.highlight_context_menu",
            });
        });

        const activate = async (tab?: browser.Tabs.Tab) => {
            if (!tab?.id) return;
            await browser.tabs.executeScript(tab?.id, { file: "content.js" });
        }

        browser.contextMenus.onClicked.addListener((_, tab) => {
            activate(tab);
        });
    }

    constructor() {
        super();
        this._hookedTabs = new Map();
        sdk.request(fetchRequest);
        this._hookBrowser();
    }

    private async _broadcast(messages: ToContentMessage[]): Promise<void> {
        this._hookedTabs.forEach((port, _) => {
            messages.forEach(message => port.postMessage(message));
        });
    }

    private async _broadcastUrl(messages: ToContentMessage[], url: string): Promise<void> {
        const tabs = await browser.tabs.query({ url });
        for (const message of messages) {
            for (const tab of tabs) {
                if (!this._hookedTabs.has(tab.id!)) continue;
                this._hookedTabs.get(tab.id!)?.postMessage(message);
            }
        }
    }

    async broadcast(message: ToContentMessage | ToContentMessage[], url?: string) {
        const messages = Array.isArray(message) ? message : [message];
        await (url ? this._broadcastUrl(messages, url) : this._broadcast(messages));
    }

    async fetchStorage(keys: string[]): Promise<Record<string, any>> {
        return browser.storage.local.get(keys);
    }

    async setStorage(values: Record<string, any>): Promise<void> {
        await browser.storage.local.set(values);
    }

    override async setupClient(newClient: Client) {
        await super.setupClient(newClient);
        this.broadcast(newClient.loginMessage());
    }
}

new WebExtPlatform();
/* browser.action.onClicked.addListener(activate); */

