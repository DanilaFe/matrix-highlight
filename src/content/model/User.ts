import {immerable} from "immer";

export type UserFields = {
    id: string;
    name: string;
    membership: string;
};

export class User {
    [immerable] = true;

    id: string;
    name: string;
    membership: string;

    constructor(props: UserFields) {
        this.name = props.name;
        this.id = props.id;
        this.membership = props.membership;
    }
}
