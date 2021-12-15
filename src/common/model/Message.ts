import {immerable} from "immer";

export type MessageFields = {
    id: number | string;
    plainBody?: string;
    formattedBody?: string;
    userId: string
}

export class Message {
    [immerable] = true;

    id: number | string;
    plainBody?: string;
    formattedBody?: string;
    userId: string;

    constructor(props: MessageFields) {
        this.id = props.id;
        this.plainBody = props.plainBody;
        this.formattedBody = props.formattedBody;
        this.userId = props.userId;
    }
}
