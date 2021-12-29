import {Highlight} from "../../common/model/Highlight";
import {highlightTextPortion, clearTextPortion} from "./dom";
import {iterateTextPieces, decodeNodeData} from "./location";

class HighlightData {
    private _structural: HTMLElement[] = [];
    private _highlights: HTMLElement[] = [];
    private _left: number = 0
    private _top: number = 0
    private _bottom: number = 0;

    get top(): number { return this._top; }
    get left(): number { return this._left; }
    get bottom(): number { return this._bottom; }
    get id(): number | string { return this._highlight.id; }
    get active(): boolean { return this._highlight.active; }

    constructor(private _renderer: EffectfulRenderer, private _highlight: Highlight) {}

    replaceHighlight(newHighlight: Highlight) {
        if (this._highlight.color !== newHighlight.color) {
            for (const highlight of this._highlights) {
                highlight.classList.toggle(this._highlight.color, false);
                highlight.classList.toggle(newHighlight.color, true);
            }
        }
        this._highlight = newHighlight;
        for (const highlight of this._highlights) {
            highlight.classList.toggle("active", this._highlight.active);
        }
    }

    recalculateOffset() {
        let left = Infinity;
        let top = Infinity;
        let bottom = 0;
        for (const highlightElement of this._highlights) {
            const boundingRect = highlightElement.getBoundingClientRect();
            left = Math.min(left, boundingRect.left);
            top = Math.min(top, boundingRect.top);
            bottom = Math.max(bottom, boundingRect.bottom);
        }
        this._left = left + window.scrollX;
        this._top = top + window.scrollY;
        this._bottom = bottom + window.scrollY;
    }

    show() {
        const start = decodeNodeData(this._highlight.from);
        const end = decodeNodeData(this._highlight.to);
        if (!start || !end) { return; }

        const toHighlight: { node: Text, from: number, to: number }[] = [];
        iterateTextPieces(start.node, start.offset, end.node, end.offset, (node, from, to) => {
            toHighlight.push({ node, from, to });
        });
        for (const {node, from, to} of toHighlight) {
            const newElements = highlightTextPortion(node, from, to, this._highlight.id, this._highlight.color);
            if (!newElements) continue;
            newElements.highlight.onmouseenter = () => { this._renderer._hoverBegin(this._highlight.id); };
            newElements.highlight.onmouseleave = () => { this._renderer._hoverEnd(this._highlight.id); };
            newElements.highlight.onclick = () => { this._renderer._clicked(this._highlight.id, this._top, this._left, this._bottom); };
            newElements.highlight.classList.toggle("active", this._highlight.active);
            this._highlights.push(newElements.highlight);
            if (newElements.structural) this._structural.push(newElements.structural);
        }
        this.recalculateOffset();
    }

    hide() {
        const relevantNodes = document.querySelectorAll(`[data-mhl-id="${this._highlight.id}"]`);
        for (const node of Array.from(relevantNodes)) {
            clearTextPortion(node);
        }
    }
}

export type RendererSubscriber = {
    activeChange?(id: number | string | null): void;
    click?(id: number | string, top: number, left: number, bottom: number): void;
    move?(id: number | string, top: number, left: number, bottom: number): void;
};

class EffectfulRenderer {
    private _highlightData: HighlightData[] = [];
    private _hoverStack: (number | string)[] = [];
    private _subscriber: RendererSubscriber | null = null;
    private _timer: ReturnType<typeof setTimeout> | null = null;

    subscribe(subscriber: RendererSubscriber) {
        this._subscriber = subscriber;
        window.addEventListener("resize", () => {
            for (const data of this._highlightData) {
                data.recalculateOffset();
                subscriber.move?.(data.id, data.top, data.left, data.bottom);
            }
        });
    }

    _hoverBegin(id: number | string) {
        if (this._hoverStack.includes(id)) return;
        this._hoverStack.push(id);
        this._subscriber?.activeChange?.(id);
    }

    _hoverEnd(id: number | string ){
        const index = this._hoverStack.indexOf(id);
        if (index === -1) return;
        if (index === this._hoverStack.length - 1) {
            // Removed top element, need to change active.
            this._hoverStack.pop();
            const newTop = this._hoverStack[this._hoverStack.length - 1];
            this._subscriber?.activeChange?.(newTop === undefined ? null : newTop);
        } else {
            // Removed middle element, no need to change active.
            this._hoverStack.splice(index, 1);
        }
    }

    _clicked(id: number | string, top: number, left: number, bottom: number) {
        this._subscriber?.click?.(id, top, left, bottom);
    }

    private _pushHighlight(highlight: Highlight) {
        const newData = new HighlightData(this, highlight);
        this._highlightData.push(newData);
        newData.show();
    }

    private _rerender(highlights: readonly Highlight[]) {
        for (const data of this._highlightData.slice().reverse()) {
            data.hide();
        }
        this._highlightData.length = 0;
        for (const highlight of highlights) {
            if (highlight.visible) this._pushHighlight(highlight);
        }
    }

    _apply(highlights: readonly Highlight[]) {
        let i = 0;
        for (const highlight of highlights) {
            if (!highlight.visible) continue;

            if (i >= this._highlightData.length) {
                // We're past existing data and we're now just adding new things.
                this._pushHighlight(highlight);
                i++;
                continue;
            }
            if (this._highlightData[i].id !== highlight.id) {
                // Darn, insertion or deletion. We have to re-render;
                this._rerender(highlights);
                return;
            }

            // It's the same highlight, but properties might've changed.
            this._highlightData[i].replaceHighlight(highlight);
            
            i++;
        }
        if (i < this._highlightData.length) {
            // Trailing deletions. We can actually handle these.
            for (let j = this._highlightData.length - 1; j >= i; j--) {
                this._highlightData[j].hide();
            }
            this._highlightData.length = i;
        }
    }

    apply(highlights: readonly Highlight[]) {
        if (this._timer) clearTimeout(this._timer);
        this._timer = setTimeout(() => {
            this._apply(highlights);
            this._timer = null;
        }, 10);
    }
}

export const Renderer = new EffectfulRenderer();
