import {User} from "./User";
import {Highlight} from "./Highlight";
import {immerable} from "immer";
import {EchoStore} from "./EchoStore";

export type RoomFields = {
    id: string;
    name: string;
    membership: string;
    users?: User[];
    highlightStore?: EchoStore<Highlight>
}

export class Room {
    [immerable] = true;

    id: string;
    name: string;
    membership: string;
    users: User[];
    highlightStore: EchoStore<Highlight>;

    get joinedUsers() { return this.users.filter(u => u.membership === "join"); }
    get localHighlights(): readonly Highlight[] { return this.highlightStore.local; };
    get remoteHighlights(): readonly Highlight[] { return this.highlightStore.remote; };
    get highlights(): readonly Highlight[] { return this.highlightStore.all; }

    static fromOther(other: Room) {
        return new Room({
            id: other.id,
            name: other.name,
            membership: other.membership,
            users: other.users.map(u => User.fromOther(u)),
            highlightStore: EchoStore.fromOther(other.highlightStore, Highlight.fromOther)
        });
    }
    
    constructor(props: RoomFields) {
        this.id = props.id;
        this.name = props.name;
        this.membership = props.membership;
        this.users = props.users || [];
        this.highlightStore = props.highlightStore || new EchoStore([], []);
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
        this.highlightStore.addLocal(highlight);
    }

    addRemoteHighlight(highlight: Highlight, txnId: number | undefined, placeAtTop: boolean = false) {
        this.highlightStore.addRemote(highlight, txnId, placeAtTop);
    }

    setHighlightVisibility(id: string | number, visibility: boolean) {
        this.changeHighlight(id, hl => hl.visible = visibility);
    }

    changeHighlight(id : string | number, transform: (h: Highlight) => void): void {
        this.highlightStore.change(id, transform);
    }
}
