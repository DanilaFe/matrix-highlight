import {Room} from "./Room";
import {PublicRoom} from "./PublicRoom";
import {immerable} from "immer";

export type PageFields = {
    rooms?: Room[];
    suggestedRoomIds?: PublicRoom[];
}

export class Page {
    [immerable] = true;

    rooms: Room[];
    suggestedRooms: PublicRoom[];

    get joinedRooms(): Room[] { return this.rooms.filter(r => r.membership === "join"); }
    get invitedRooms(): Room[] { return this.rooms.filter(r => r.membership === "invite"); }

    constructor(props: PageFields) {
        this.rooms = props.rooms || [];
        this.suggestedRooms = props.suggestedRoomIds || [];
    }

    addRoom(room: Room): void {
        if (this.rooms.findIndex(it => it.id === room.id) !== -1) return;
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

    addSuggestedRoom(room: PublicRoom): void {
        if (this.suggestedRooms.findIndex(it => it.id === room.id) !== -1) return;
        this.suggestedRooms.push(room);
    }

    changeSuggestedRoom(id: string, change: (room: PublicRoom) => void) {
        for (const room of this.suggestedRooms) {
            if (room.id === id) change(room);
        }
    }
}
