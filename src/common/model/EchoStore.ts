export interface EchoItem {
    id: number | string
}

export class EchoStore<T extends EchoItem> {
    private _local: T[];
    private _remote: T[];

    get local(): readonly T[] { return this._local; }
    get remote(): readonly T[] { return this._remote; }
    get all(): readonly T[] { return [...this._remote, ...this._local]; }

    constructor(local: T[], remote: T[]) {
        this._local = local;
        this._remote = remote;
    }

    addLocal(local: T) {
        this._local.push(local);
    }

    addRemote(remote: T, txnId: number | undefined, placeAtTop: boolean = false) {
        const localIndex = this._local.findIndex(t => t.id === txnId);
        if (localIndex !== -1) {
            this._local.splice(localIndex, 1);
        }
        if (placeAtTop) {
            this._remote.splice(0, 0, remote);
        } else {
            this._remote.push(remote);
        }
    }

    get(itemId: number | string): T | undefined {
        const local = this._local.find(it => it.id === itemId);
        if (local) return local;
        return this._remote.find(it => it.id === itemId);
    }

    change(itemId: number | string, change: (item: T) => void) {
        const doTransform = (it: T) => {
            if (it.id === itemId) change(it);
        }
        this._local.forEach(doTransform);
        this._remote.forEach(doTransform);
    }
}
