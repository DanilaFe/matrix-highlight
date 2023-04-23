import global from "../global.module.scss";

export function isHighlight(node: Node): boolean {
    return node.nodeType === Node.ELEMENT_NODE && (node as Element).hasAttribute('data-mhl-highlight');
}

export function isStructural(node: Node): boolean {
    return node.nodeType === Node.ELEMENT_NODE && (node as Element).hasAttribute('data-mhl-structural');
}

export function isInserted(node: Node): boolean {
    return isHighlight(node) || isStructural(node);
}

export function getLength(node: Node): number {
    if (isInserted(node)) {
        return parseInt((node as Element).getAttribute('data-mhl-length') || "0");
    } else if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent?.length || 0;
    }
    return 0;
}

export function makeHighlightSpan(doc: Document, id: number | string, length: number): HTMLElement {
    const span = doc.createElement('span');
    span.setAttribute('data-mhl-length', length.toString());
    span.setAttribute('data-mhl-id', id.toString());
    return span;
}

export function unpackStructural(node: Element): [ Node | undefined, Element, Node | undefined ] {
    const id = node.getAttribute('data-mhl-id');
    let left: Node | undefined, right: Node | undefined, highlight: Element;
    if (node.childNodes[0].nodeType === Node.ELEMENT_NODE && (node.childNodes[0] as Element).getAttribute('data-mhl-id') === id) {
        highlight = node.childNodes[0] as Element;
        right = node.childNodes[1];
    } else {
        left = node.childNodes[0];
        highlight = node.childNodes[1] as Element;
        right = node.childNodes[2];
    }
    return [left, highlight, right];
}

export function highlightTextPortion(textNode: Text, from: number, to: number, id: number | string, color: string): { highlight: HTMLElement, structural?: HTMLElement } | null {
    if (to <= from) {
        return null;
    }
    const doc = textNode.ownerDocument;
    const string = textNode.textContent || "";
    const before = string.slice(0, from);
    const middle = string.slice(from, to);
    const after = string.slice(to, string.length);

    const structural = makeHighlightSpan(doc, id, string.length);
    structural.setAttribute('data-mhl-structural', "true");
    const highlight = makeHighlightSpan(doc, id, to-from);
    highlight.setAttribute('data-mhl-highlight', "true");
    highlight.classList.add(global.highlight);
    highlight.classList.add(global[color]);
    highlight.textContent = middle;

    if (before) { structural.appendChild(doc.createTextNode(before)); }
    structural.appendChild(highlight);
    if (after) { structural.appendChild(doc.createTextNode(after)); }

    if (before || after) {
        textNode.parentElement?.replaceChild(structural, textNode);
        return { structural, highlight };
    } else {
        textNode.parentElement?.replaceChild(highlight, textNode);
        return { highlight };
    }
}

export function clearTextPortion(node: Element): void {
    const doc = node.ownerDocument;
    if (isStructural(node)) {
        const [left, highlight, right] = unpackStructural(node);
        const newNode = doc.createTextNode((left?.textContent || "") + ((highlight.childNodes[0] as Text).textContent || "") + (right?.textContent || ""));
        node.parentNode?.replaceChild(newNode, node);
    } else {
        node.parentNode?.replaceChild(node.childNodes[0], node);
    }
}

