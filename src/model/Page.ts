import {Room} from "./Room";
import {immerable} from "immer";

export type PageFields = {
    rooms?: Room[];
}

export class Page {
    [immerable] = true;

    rooms: Room[];
    
    constructor(props: PageFields) {
        this.rooms = props.rooms || [];
    }

    addRoom(room: Room): void {
        this.rooms.push(room);
    }

    getRoom(id: string | null): Room | null {
        return this.rooms.find(r => r.id === id) || null;
    }

    changeRoom(id: string, change: (room: Room) => void) {
        for (const room of this.rooms) {
            if (room.id === id) change(room);
        }
    }
}
