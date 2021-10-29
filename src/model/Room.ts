import {User} from "./User";
import {Highlight} from "./Highlight";

export type RoomFields = {
    id: string;
    name: string;
    users?: User[];
    localHighlights?: Highlight[];
    remoteHighlights?: Highlight[];
}

export class Room {
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
