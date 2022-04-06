import {StorageProvider} from "./provider";

export class LocalStorageProvider implements StorageProvider {
    async fetchStorage(keys: string[]): Promise<Record<string, any>> {
        const target: Record<string, any> = {};
        for (const key of keys) {
            const fetchResult = localStorage.getItem(`matrixHighlight_${key}`);
            target[key] = fetchResult !== null ? JSON.parse(fetchResult) : null;
        }
        return target;
    }

    async setStorage(object: Record<string, any>): Promise<void> {
        for (const key in object) {
            localStorage.setItem(`matrixHighlight_${key}`, JSON.stringify(object[key]));
        }
    }
}
