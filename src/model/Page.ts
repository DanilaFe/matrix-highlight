import {Room} from "./Room";

export type PageFields = {
    rooms?: Room[];
    currentRoom?: Room | null;
}

export class Page {
    rooms: Room[];
    currentRoom: Room | null
    
    constructor(props: PageFields) {
        this.rooms = props.rooms || [];
        this.currentRoom = props.currentRoom || null;
    }
}
