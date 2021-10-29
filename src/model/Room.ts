import {User} from "./User";
import {Highlight} from "./Highlight";
import {immerable} from "immer";

export type RoomFields = {
    id: string;
    name: string;
    users?: User[];
    localHighlights?: Highlight[];
    remoteHighlights?: Highlight[];
}

export class Room {
    [immerable] = true;

    id: string;
    name: string;
    users: User[];
    localHighlights: Highlight[];
    remoteHighlights: Highlight[];

    get highlights() { return [...this.remoteHighlights, ...this.localHighlights]; }
    
    constructor(props: RoomFields) {
        this.id = props.id;
        this.name = props.name;
        this.users = props.users || [];
        this.localHighlights = props.localHighlights || [];
        this.remoteHighlights = props.remoteHighlights || [];
    }
}
