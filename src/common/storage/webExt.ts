import * as browser from "webextension-polyfill";
import {StorageProvider} from "./provider";

export class WebExtStorageProvider implements StorageProvider {
    async fetchStorage(keys: string[]): Promise<Record<string, any>> {
        return await browser.storage.local.get(keys);
    }

    async setStorage(values: Record<string, any>): Promise<void> {
        await browser.storage.local.set(values);
    }

}
