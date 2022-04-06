import App from "../content/App";
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
        this.contentPlatform = new LocalStorageContentPlatform(this);
        this.backgroundPlatform = new LocalStorageBackgroundPlatform(this);
    }
}

class LocalStorageContentPlatform extends ContentPlatform {
    constructor (private _combined: CombinedPlatform) { super(new LocalStorageProvider()); }

    sendMessage(message: FromContentMessage): Promise<void> {
        return {} as any
    }

    setCallback(callback: (message: ToContentMessage) => void): void {

    }
}

class LocalStorageBackgroundPlatform extends BackgroundPlatform {
    constructor(private _combined: CombinedPlatform) { super(new LocalStorageProvider()); }

    broadcast(message: ToContentMessage | ToContentMessage[], url: string | undefined) {
        if (url && url !== window.location.href) return;
        const messages = Array.isArray(message) ? message : [message];
        for (const message of messages) {
            
        }
    }
}
