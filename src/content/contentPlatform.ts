import {BasePlatform} from "../common/basePlatform";
import {ToContentMessage, FromContentMessage} from "../common/messages";

export abstract class ContentPlatform extends BasePlatform {
    private _callback: ((message: ToContentMessage) => void) | null = null

    abstract sendMessage(message: FromContentMessage): void;

    async freshTxnId(): Promise<number> {
        const txnId = (await this.fetchStorage([ "txnId" ]))["txnId"] || 0;
        await this.setStorage({ txnId: txnId + 1 });
        return txnId;
    }

    protected _runCallback(message: ToContentMessage): void {
        if (this._callback) this._callback(message);
    }

    setCallback(callback: (message: ToContentMessage) => void): void {
        this._callback = callback;
    }
}
