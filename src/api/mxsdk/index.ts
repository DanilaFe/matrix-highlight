import * as sdk from "matrix-js-sdk";
import {Authentication, ClientSubscriber, Client, Storage} from "../common";
import {HighlightContent} from "../../model/matrix";

class MxsdkClient implements Client {
    private _subscriber: ClientSubscriber | null = null;
    private _seenRooms: Set<string> = new Set();

    constructor(private _sdkClient: sdk.MatrixClient) {}

    async _setup(): Promise<typeof this> {
        await this._sdkClient.startClient({initialSyncLimit: 100});
        while (!this._sdkClient.isInitialSyncComplete()) {
            await new Promise(resolve => setTimeout(resolve, 1000))
        }
        return this;
    }

    async createRoom(){ return ""; }
    async sendHighlight(roomId: string, content: HighlightContent) { return ""; }
    async setHighlightVisibility(roomId: string, highlightId: string, visibility: boolean) {}
    async shutdown(){}

    subscribe(subscriber: ClientSubscriber): void {
        this._subscriber = subscriber;
    }
}

export class MxsdkAuth implements Authentication {
    constructor(private _storage: Storage) {}

    private async _createClient(baseUrl: string, userId?: string, accessToken?: string): Promise<sdk.MatrixClient> {
        return sdk.createClient({ baseUrl, userId, accessToken, });
    }

    async fromSaved() {
        const userId = this._storage.getString("matrixId");
        const accessToken = this._storage.getString("matrixToken");
        if (!userId || !accessToken) return null;

        const server = userId.substring(userId.indexOf(":") + 1);
        const sdkClient = await this._createClient(`https://${server}`, userId, accessToken);
        return new MxsdkClient(sdkClient)._setup();
    }

    async fromBasic(username: string, password: string, homeserver: string) {
        const client = await this._createClient(`https://${homeserver}`);
        const result = await client.loginWithPassword(username, password);
        if (result.errcode) {
            return null;
        }

        this._storage.setString("matrixId", result.user_id);
        this._storage.setString("matrixToken", result.access_token);
        return new MxsdkClient(client)._setup();
    }
}
