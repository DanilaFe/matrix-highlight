import {HighlightContent} from "../model/matrix";
import {Room, User, Highlight} from "../model";

export interface Storage {
    getString(key: string): string | null;
    setString(key: string, value: string): void;
}

export interface ClientSubscriber {
    addRoom?(newRoom: Room): void;
    removeRoom?(removedId: string): void;
    addUser?(roomId: string, newUser: User): void;
    removeUser?(roomId: string, userId: string): void;
    highlight?(roomId: string, highlight: Highlight, txnUd: number | undefined): void;
    setHighlightVisibility?(roomId: string, highlightId: string, visibility: boolean): void;
};

export interface Client {
    createRoom(): Promise<string>;
    sendHighlight(roomId: string, highlight: HighlightContent, txnId: number): Promise<string>;
    setHighlightVisibility(roomId: string, id: string, visibility: boolean): Promise<void>;
    shutdown(): Promise<void>;

    subscribe(listener: ClientSubscriber): void;
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
