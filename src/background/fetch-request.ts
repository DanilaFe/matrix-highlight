import * as queryString from "querystring";
import * as qs from "qs";

type RequestOpts = {
    uri: string,
    method: string,
    withCredentials: boolean,
    qs?: any
    qsStringifyOptions?: any
    useQuerystring?: boolean,
    body?: any,
    json: boolean,
    timeout: number,
    headers: any
}

type Response = {
    statusCode: number,
    headers: any
}

type Callback = (error: Error | null, response: Response, body: any) => void;

export function fetchRequest(opts: RequestOpts, callback: Callback) {
    const body = opts.json ? JSON.stringify(opts.body) : opts.body as string;
    const query = (opts.useQuerystring ? qs : queryString).stringify(opts.qs, opts.qsStringifyOptions);
    const url = `${opts.uri}?${query}`;
    fetch(url, {
        method: opts.method,
        credentials: opts.withCredentials ? 'include' : 'same-origin',
        headers: opts.headers,
        body,
    }).then(async response => {
        const body = await (opts.json ? response.json() : response.text());
        callback(null, { statusCode: response.status, headers: response.headers }, body);
    });
}
