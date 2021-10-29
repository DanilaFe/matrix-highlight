import {Highlight} from "../model/Highlight";
import {highlightTextPortion, clearTextPortion} from "./dom";
import {iterateTextPieces, decodeNodeData} from "./location";

class HighlightData {
    private _structural: HTMLElement[] = [];
    private _highlights: HTMLElement[] = [];
    private _left: number = 0
    private _top: number = 0

    get id(): number | string { return this._highlight.id; }
    get active(): boolean { return this._highlight.active; }

    constructor(private _renderer: EffectfulRenderer, private _highlight: Highlight) {}

    replaceHighlight(newHighlight: Highlight) {
        this._highlight = newHighlight;
        for (const highlight of this._highlights) {
            highlight.classList.toggle("active", this._highlight.active);
        }
    }

    private _recalculateOffset() {
        let left = Infinity;
        let top = Infinity;
        for (const highlightElement of this._highlights) {
            const boundingRect = highlightElement.getBoundingClientRect();
            left = Math.min(left, boundingRect.left);
            top = Math.min(top, boundingRect.top);
        }
        this._left = left;
        this._top = top;
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
            newElements.highlight.classList.toggle("active", this._highlight.active);
            this._highlights.push(newElements.highlight);
            if (newElements.structural) this._structural.push(newElements.structural);
        }
        this._recalculateOffset();
    }

    hide() {
        const relevantNodes = document.querySelectorAll(`[data-mhl-id="${this._highlight.id}"]`);
        for (const node of Array.from(relevantNodes)) {
            clearTextPortion(node);
        }
    }
}

class EffectfulRenderer {
    private _highlightData: HighlightData[] = [];
    private _hoverStack: (number | string)[] = [];
    private _onActiveChange: ((id: number | string | null) => void) | null = null;

    setActiveListener(listener: typeof this._onActiveChange) {
        this._onActiveChange = listener;
    }

    _hoverBegin(id: number | string) {
        if (this._hoverStack.includes(id)) return;
        this._hoverStack.push(id);
        if (this._onActiveChange) this._onActiveChange(id);
    }

    _hoverEnd(id: number | string ){
        const index = this._hoverStack.indexOf(id);
        if (index === -1) return;
        if (index === this._hoverStack.length - 1) {
            // Removed top element, need to change active.
            this._hoverStack.pop();
            const newTop = this._hoverStack[this._hoverStack.length - 1];
            if (this._onActiveChange) this._onActiveChange(newTop === undefined ? null : newTop);
        } else {
            // Removed middle element, no need to change active.
            this._hoverStack.splice(index, 1);
        }
    }

    private _pushHighlight(highlight: Highlight) {
        const newData = new HighlightData(this, highlight);
        this._highlightData.push(newData);
        newData.show();
    }

    private _rerender(highlights: Highlight[]) {
        for (const data of this._highlightData.slice().reverse()) {
            data.hide();
        }
        this._highlightData.length = 0;
        for (const highlight of highlights) {
            this._pushHighlight(highlight);
        }
    }

    apply(highlights: Highlight[]) {
        let i = 0;
        for (const highlight of highlights) {
            if (!highlight.visible) continue;

            if (i >= this._highlightData.length) {
                // We're past existing data and we're now just adding new things.
                this._pushHighlight(highlight);
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
}

export const Renderer = new EffectfulRenderer();
