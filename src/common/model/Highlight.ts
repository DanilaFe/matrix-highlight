import {HighlightContent, NodeData, HIGHLIGHT_COLOR_KEY, HIGHLIGHT_START_KEY, HIGHLIGHT_END_KEY, HIGHLIGHT_TEXT_KEY} from "./matrix"
import {Message} from "./Message";
import {immerable} from "immer";
import {EchoStore} from "./EchoStore";

export class Highlight {
    [immerable] = true;

    static fromOther(other: Highlight) {
        return new Highlight(
            other.id, other.content, other.visible, other.active,
            EchoStore.fromOther(other.messageStore, Message.fromOther)
        );
    }

    get localMessages(): readonly Message[] { return this.messageStore.local; };
    get remoteMessages(): readonly Message[] { return this.messageStore.remote; };
    get messages(): readonly Message[] { return this.messageStore.all; }

    constructor(
        public id: string | number,
        public content: HighlightContent,
        public visible: boolean = true,
        public active: boolean = false,
        public messageStore: EchoStore<Message> = new EchoStore([], [])
    ) {}

    get color(): string { return this.content[HIGHLIGHT_COLOR_KEY]; }
    get text(): string[] { return this.content[HIGHLIGHT_TEXT_KEY]; }
    get from(): NodeData { return this.content[HIGHLIGHT_START_KEY]; }
    get to(): NodeData { return this.content[HIGHLIGHT_END_KEY]; }

    addLocalMessage(message: Message) {
        this.messageStore.addLocal(message);
    }

    addRemoteMessage(message: Message, txnId: number | undefined) {
        this.messageStore.addRemote(message, txnId);
    }
}
