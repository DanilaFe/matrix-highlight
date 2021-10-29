import {Room} from "./Room";
import {immerable} from "immer";

export type PageFields = {
    rooms?: Room[];
    currentRoomId?: string | null;
}

export class Page {
    [immerable] = true;

    rooms: Room[];
    currentRoomId: string | null
    
    get currentRoom(): Room | null {
        if (this.currentRoomId === null) return null;
        return this.rooms.find(r => r.id === this.currentRoomId)!;
    }

    constructor(props: PageFields) {
        this.rooms = props.rooms || [];
        this.currentRoomId = props.currentRoomId || null;
    }
}
