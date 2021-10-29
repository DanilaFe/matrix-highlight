export type UserFields = {
    id: string;
    name: string;
};

export class User {
    id: string;
    name: string;

    constructor(props: UserFields) {
        this.name = props.name;
        this.id = props.id;
    }
}
