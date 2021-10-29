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

    getRoom(id: string | null): Room | null {
        return this.rooms.find(r => r.id === id) || null;
    }
}
