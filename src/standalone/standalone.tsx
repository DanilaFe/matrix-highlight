import App from "../content/App";
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

    constructor() {
        this.backgroundPlatform = new LocalStorageBackgroundPlatform(this);
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
    constructor(private _combined: CombinedPlatform) { super(new LocalStorageProvider()); }

    broadcast(message: ToContentMessage | ToContentMessage[], url: string | undefined) {
        if (url && url !== window.location.href) return;
        const messages = Array.isArray(message) ? message : [message];
        for (const message of messages) {
            this._combined.contentPlatform.handleMessage(message);
        }
    }
}

export async function install(htmlElement: HTMLElement) {
    const combined = new CombinedPlatform();   
    ReactDOM.render(
        <App platform={combined.contentPlatform}/>,
        htmlElement
    );
    const client = await combined.backgroundPlatform.tryCachedLogin();
    if (client) await combined.backgroundPlatform.setupClient(client);
}
