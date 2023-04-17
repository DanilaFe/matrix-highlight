import {immerable} from "immer";

export type PublicRoomFields = {
    id: string;
    name?: string | null;
}

export class PublicRoom {
    id: string;
    name: string | null;

    static fromOther(other: PublicRoom) {
        return new PublicRoom({ id: other.id, name: other.name });
    }

    constructor(props: PublicRoomFields) {
        this.id = props.id;
        this.name = props.name || null;
    }
}
