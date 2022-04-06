import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import '../common/common.scss';
import global from "!!css-loader!sass-loader!./global.module.scss";
import createCache from '@emotion/cache';
import {CacheProvider} from "@emotion/react";
import {ContentPlatform} from "./contentPlatform";
import * as browser from "webextension-polyfill";
import {ToContentMessage, FromContentMessage, PORT_TAB, PORT_RENEW} from "../common/messages";
import {WebExtStorageProvider} from "../common/storage/webExt";

class WebExtPlatform extends ContentPlatform {
    private _port: browser.Runtime.Port | null = null;
    private _connectionType: typeof PORT_TAB | typeof PORT_RENEW = PORT_TAB;

    constructor() { super(new WebExtStorageProvider()); }
    
    private _setupPort() {
        this._port = browser.runtime.connect({ name: this._connectionType });
        this._connectionType = PORT_RENEW; /* Do not retrieve all data on reconnect */
        this._port.onMessage.addListener(this._runCallback.bind(this));
        this._port.onDisconnect.addListener(() => {
            this._setupPort();
        });
        setTimeout(() => {
            const oldPort = this._port;
            this._setupPort();
            oldPort?.disconnect();
        }, 1000 * 60 * 4)
    }

    setCallback(callback: (message: ToContentMessage) => void): void {
        super.setCallback(callback);
        /* Only start port after we have a callbck registered, to avoid missing events. */
        if (!this._port) this._setupPort();
    }

    sendMessage(message: FromContentMessage): void {
        this._port?.postMessage(message);
    }
}

const newElement = document.createElement('div');
newElement.attachShadow({ mode: "open" });
document.body.appendChild(newElement);
const { shadowRoot } = newElement;

const shadowCache = createCache({
    key: 'emotion',
    container: shadowRoot as any
});

const globalStyle = document.createElement('style');
globalStyle.innerHTML = global.toString();
document.head.appendChild(globalStyle);
for (const styleTag of (window as any)._matrixHighlightStyleNodes) {
    shadowRoot?.appendChild(styleTag);
};

const reactRoot = document.createElement('div');
reactRoot.classList.add("matrix-highlight");
shadowRoot?.appendChild(reactRoot);
ReactDOM.render(
  <React.StrictMode>
      <CacheProvider value={shadowCache}>
        <App platform={new WebExtPlatform()}/>
      </CacheProvider>
  </React.StrictMode>,
  reactRoot
);
