import {HighlightContent} from "../model/matrix";
import {Page} from "../model";

export interface Storage {
    getString(key: string): string | null;
    setString(key: string, value: string): void;
}

export interface Client {
    setUpdateHandler(handler: (newPage: Page) => void): void;
    createRoom(): Promise<string>;
    sendHighlight(highlight: HighlightContent, txnId: number): Promise<string>;
    setHighlightVisibility(id: string, visibility: boolean): Promise<void>;
}

export interface Authentication {
    fromSaved(): Promise<Client | null>;
    fromBasic(username: string, password: string, homeserver: string): Promise<Client | null>;
}

export class LocalStorage implements Storage {
    getString(key: string): string | null {
        return localStorage.getItem(key);
    }

    setString(key: string, value: string): void {
        localStorage.setItem(key, value);
    }
}
