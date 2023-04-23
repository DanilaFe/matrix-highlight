import App from "../content/App";
import global from "!!css-loader!sass-loader!../content/global.module.scss";
import ReactDOM from 'react-dom';
import {ContentPlatform} from "../content/contentPlatform";
import {BackgroundPlatform} from "../background/backgroundPlatform";
import {FromContentMessage, ToContentMessage} from "../common/messages";
import {fetchRequest} from "../background/fetch-request";
import * as sdk from "matrix-js-sdk";
import '../common/common.scss';
import {LocalStorageProvider} from "../common/storage/localStorage";

sdk.request(fetchRequest);

class CombinedPlatform {
    contentPlatform: LocalStorageContentPlatform;
    backgroundPlatform: LocalStorageBackgroundPlatform;

    constructor(url: string) {
        this.backgroundPlatform = new LocalStorageBackgroundPlatform(this, url);
        this.contentPlatform = new LocalStorageContentPlatform(this);
    }
}

class LocalStorageContentPlatform extends ContentPlatform {
    constructor (private _combined: CombinedPlatform) { super(new LocalStorageProvider()); }

    async sendMessage(message: FromContentMessage): Promise<void> {
        const response = await this._combined.backgroundPlatform.handleMessage(message);   
        if (response) this.handleMessage(response);
    }

    handleMessage(message: ToContentMessage): void {
        this._runCallback(message);
    }
}

class LocalStorageBackgroundPlatform extends BackgroundPlatform {
    constructor(private _combined: CombinedPlatform, private _url: string) { super(new LocalStorageProvider()); }

    broadcast(message: ToContentMessage | ToContentMessage[], url: string | undefined) {
        if (url && url !== this._url) return;
        const messages = Array.isArray(message) ? message : [message];
        for (const message of messages) {
            this._combined.contentPlatform.handleMessage(message);
        }
    }
}

export async function install(htmlElement: HTMLElement, win?: Window, url?: string) {
    const theWindow = (win || window);
    const theUrl = url || theWindow.location.href;
    const globalStyle = theWindow.document.createElement('style');
    globalStyle.innerHTML = global.toString();
    theWindow.document.head.appendChild(globalStyle);

    const combined = new CombinedPlatform(theUrl);   
    ReactDOM.render(
        <App platform={combined.contentPlatform} window={theWindow} url={theUrl}/>,
        htmlElement
    );
    const client = await combined.backgroundPlatform.tryCachedLogin();
    if (client) await combined.backgroundPlatform.setupClient(client);
}
