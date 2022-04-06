import { ToContentMessage } from "../common/messages";
import { Client } from "./client";
import * as sdk from "matrix-js-sdk";

const LOCALSTORAGE_ID_KEY = "matrixId";
const LOCALSTORAGE_TOKEN_KEY = "matrixToken";

export abstract class Platform {
    protected _client: Client | null = null;

    abstract broadcast(message: ToContentMessage | ToContentMessage[], url?: string): void;
    abstract fetchStorage(keys: string[]): Promise<Record<string, any>>;
    abstract setStorage(keys: Record<string, any>): Promise<void>;

    private async _fetchBaseUrl(server: string) {
        return fetch(`https://${server}/.well-known/matrix/client`)
            .then(response => response.json())
        .then(json => json["m.homeserver"]?.base_url || `https://${server}`)
            .catch(() => `https://${server}`);
    }

    private async _fetchLogin(): Promise<{id: string, token: string, baseUrl: string } | null> {
        const credentials = await this.fetchStorage([LOCALSTORAGE_ID_KEY, LOCALSTORAGE_TOKEN_KEY]);
        const id: string | undefined = credentials[LOCALSTORAGE_ID_KEY];
        const token: string | undefined = credentials[LOCALSTORAGE_TOKEN_KEY];
        if (id && token) {
            const server = id.substring(id.indexOf(":") + 1);
            const baseUrl = await this._fetchBaseUrl(server);
            return { id, token, baseUrl };
        }
        return null;
    }

    private _createClient(opts: sdk.ICreateClientOpts): sdk.MatrixClient {
        const finalOpts = Object.assign({ unstableClientRelationAggregation: true }, opts)
        return sdk.createClient(finalOpts);
    }

    async tryCachedLogin(): Promise<Client | null> {
        const fetchedCredentials = await this._fetchLogin();
        if (!fetchedCredentials) return null;
        const { id, token, baseUrl } = fetchedCredentials;
        return new Client(this._createClient({ baseUrl, userId: id, accessToken: token }), this);
    }

    async tryLogin(username: string, password: string, homeserver: string): Promise<Client | { loginError: string }> {
        const baseUrl = await this._fetchBaseUrl(homeserver);
        const newClient = this._createClient({ baseUrl });
        let result;
        try {
            result = await newClient.login("m.login.password", {
                "identifier": {
                    "type": "m.id.user",
                    "user": username
                },
                password,
            });
        } catch (e: any) {
            return { loginError: "Invalid username or password." };
        }

        this.setStorage({
            [LOCALSTORAGE_ID_KEY]: result.user_id,
            [LOCALSTORAGE_TOKEN_KEY]: result.access_token
        });
        return new Client(newClient, this);
        // await setupClient(newClient);
        // const name = newClient.getUser(newClient.getUserId()).displayName;
        // port.postMessage({ type: "login-successful", username, homeserver, name });
    }

    async setupClient(newClient: Client) {
        this._client = newClient;
        this.broadcast(newClient.loginMessage());
        newClient.setup();
        await newClient.start();
    }

}
