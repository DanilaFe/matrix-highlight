import {immerable} from "immer";

export type MessageFields = {
    plainBody?: string;
    formattedBody?: string;
    userId: string
}

export class Message {
    [immerable] = true;

    plainBody?: string;
    formattedBody?: string;
    userId: string;

    constructor(props: MessageFields) {
        this.plainBody = props.plainBody;
        this.formattedBody = props.formattedBody;
        this.userId = props.userId;
    }
}
