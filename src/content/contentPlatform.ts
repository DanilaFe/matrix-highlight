import {ToContentMessage, FromContentMessage} from "../common/messages";
import {StorageProvider} from "../common/storage/provider";

export abstract class ContentPlatform {
    private _callback: ((message: ToContentMessage) => void) | null = null

    constructor (private _storageProvider: StorageProvider) {}

    abstract sendMessage(message: FromContentMessage): void;

    async freshTxnId(): Promise<number> {
        const txnId = (await this._storageProvider.fetchStorage([ "txnId" ]))["txnId"] || 0;
        await this._storageProvider.setStorage({ txnId: txnId + 1 });
        return txnId;
    }

    protected _runCallback(message: ToContentMessage): void {
        if (this._callback) this._callback(message);
    }

    setCallback(callback: (message: ToContentMessage) => void): void {
        this._callback = callback;
    }
}
