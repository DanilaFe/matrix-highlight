import {HighlightContent, NodeData, HIGHLIGHT_COLOR_KEY, HIGHLIGHT_START_KEY, HIGHLIGHT_END_KEY, HIGHLIGHT_TEXT_KEY} from "./matrix"
import {Message} from "./Message";
import {immerable} from "immer";

export class Highlight {
    [immerable] = true;

    static fromOther(other: Highlight) {
        return new Highlight(other.id, other.content, other.visible, other.active);
    }

    localMessages: Message[] = [];
    remoteMessages: Message[] = [];

    get messages(): Message[] { return [...this.remoteMessages, ...this.localMessages]; }

    constructor(
        public id: string | number,
        public content: HighlightContent,
        public visible: boolean = true,
        public active: boolean = false
    ) {}

    get color(): string { return this.content[HIGHLIGHT_COLOR_KEY]; }
    get text(): string[] { return this.content[HIGHLIGHT_TEXT_KEY]; }
    get from(): NodeData { return this.content[HIGHLIGHT_START_KEY]; }
    get to(): NodeData { return this.content[HIGHLIGHT_END_KEY]; }

    addLocalMessage(message: Message) {
        this.localMessages.push(message);
    }

    addRemoteMessage(message: Message, txnId?: number) {
        const localIndex = this.localMessages.findIndex(msg => msg.id === txnId);
        if (localIndex !== -1) {
            this.localMessages.splice(localIndex, 1);
        }
        this.remoteMessages.push(message);
    }
}
