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

    get joinedUsers() { return this.users.filter(u => u.membership === "join"); }
    get highlights() { return [...this.remoteHighlights, ...this.localHighlights]; }

    static fromOther(other: Room) {
        return new Room({
            id: other.id,
            name: other.name,
            membership: other.membership,
            users: other.users.map(u => User.fromOther(u)),
            localHighlights: other.localHighlights.map(h => Highlight.fromOther(h)),
            remoteHighlights: other.remoteHighlights.map(h => Highlight.fromOther(h)),
        });
    }
    
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

    changeUser(userId: string, change: (user: User) => void) {
        this.users.forEach(u => {
            if (u.id === userId) change(u);
        });
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
        this.changeHighlight(id, hl => hl.visible = visibility);
    }

    changeHighlight(id : string | number, transform: (h: Highlight) => void): void {
        const doTransform = (hl: Highlight) => {
            if (hl.id === id) transform(hl);
        }
        this.localHighlights.forEach(doTransform);
        this.remoteHighlights.forEach(doTransform);
    }
}
