import {BasePlatform} from "../common/basePlatform";
import {ToContentMessage, FromContentMessage} from "../common/messages";

export abstract class ContentPlatform extends BasePlatform {
    abstract setCallback(callback: (message: ToContentMessage) => void): void;
    abstract sendMessage(message: FromContentMessage): void;

    async freshTxnId(): Promise<number> {
        const txnId = (await this.fetchStorage([ "txnId" ]))["txnId"] || 0;
        await this.setStorage({ txnId: txnId + 1 });
        return txnId;
    }
}
