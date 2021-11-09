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

    static fromOther(other: User) {
        return new User({
            id: other.id,
            name: other.name,
            membership: other.membership
        });
    }

    constructor(props: UserFields) {
        this.name = props.name;
        this.id = props.id;
        this.membership = props.membership;
    }
}
