import {immerable} from "immer";

export interface EchoItem {
    id: number | string
}

export class EchoStore<T extends EchoItem> {
    [immerable] = true;

    local: T[];
    remote: T[];

    get all(): readonly T[] { return [...this.remote, ...this.local]; }

    static fromOther<T extends EchoItem>(other: EchoStore<T>, clone: (item: T) => T): EchoStore<T> {
        return new EchoStore(other.local.map(clone), other.remote.map(clone));
    }

    constructor(local: T[], remote: T[]) {
        this.local = local;
        this.remote = remote;
    }

    addLocal(local: T) {
        this.local.push(local);
    }

    addRemote(remote: T, txnId: number | undefined, placeAtTop: boolean = false) {
        const localIndex = this.local.findIndex(t => t.id === txnId);
        if (localIndex !== -1) {
            this.local.splice(localIndex, 1);
        }
        if (placeAtTop) {
            this.remote.splice(0, 0, remote);
        } else {
            this.remote.push(remote);
        }
    }

    get(itemId: number | string): T | undefined {
        const local = this.local.find(it => it.id === itemId);
        if (local) return local;
        return this.remote.find(it => it.id === itemId);
    }

    change(itemId: number | string, change: (item: T) => void) {
        const doTransform = (it: T) => {
            if (it.id === itemId) change(it);
        }
        this.local.forEach(doTransform);
        this.remote.forEach(doTransform);
    }
}
