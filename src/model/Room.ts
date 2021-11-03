import {User} from "./User";
import {Highlight} from "./Highlight";
import {immerable} from "immer";

export type RoomFields = {
    id: string;
    name: string;
    membership: string;
    users?: User[];
    localHighlights?: Highlight[];
    remoteHighlights?: Highlight[];
}

export class Room {
    [immerable] = true;

    id: string;
    name: string;
    membership: string;
    users: User[];
    localHighlights: Highlight[];
    remoteHighlights: Highlight[];

    get highlights() { return [...this.remoteHighlights, ...this.localHighlights]; }
    
    constructor(props: RoomFields) {
        this.id = props.id;
        this.name = props.name;
        this.membership = props.membership;
        this.users = props.users || [];
        this.localHighlights = props.localHighlights || [];
        this.remoteHighlights = props.remoteHighlights || [];
    }

    addUser(user: User) {
        this.users.push(user);
    }

    addLocalHighlight(highlight: Highlight) {
        this.localHighlights.push(highlight);
    }

    addRemoteHighlight(highlight: Highlight, txnId?: number) {
        const localIndex = this.localHighlights.findIndex(h => h.id === txnId);
        if (localIndex !== -1) {
            this.localHighlights.splice(localIndex, 1);
        }
        this.remoteHighlights.push(highlight);
    }

    setHighlightVisibility(id: string | number, visibility: boolean) {
        const transform = (hl: Highlight) => {
            if (hl.id === id) hl.visible = visibility;
        };
        this.localHighlights.forEach(transform);
        this.remoteHighlights.forEach(transform);
    }
}
