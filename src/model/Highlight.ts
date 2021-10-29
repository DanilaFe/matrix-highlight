import {HighlightContent, NodeData, HIGHLIGHT_COLOR_KEY, HIGHLIGHT_START_KEY, HIGHLIGHT_END_KEY, HIGHLIGHT_TEXT_KEY} from "./matrix"

export class Highlight {
    constructor(public id: number, public content: HighlightContent, public visible: boolean = true) {}

    get color(): string { return this.content[HIGHLIGHT_COLOR_KEY]; }
    get text(): string[] { return this.content[HIGHLIGHT_TEXT_KEY]; }
    get from(): NodeData { return this.content[HIGHLIGHT_START_KEY]; }
    get to(): NodeData { return this.content[HIGHLIGHT_END_KEY]; }

    withContent(overrides: { [key in keyof HighlightContent]?: HighlightContent[key] }): Highlight {
        return new Highlight(this.id, Object.assign({}, this.content, overrides), this.visible);
    }

    withVisibility(visible: boolean): Highlight {
        return new Highlight(this.id, this.content, visible);
    }
}
