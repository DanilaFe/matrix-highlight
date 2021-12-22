import {isInserted, getLength} from "./dom";
import {
    HIGHLIGHT_NODE_PATH_KEY, HIGHLIGHT_NODE_OFFSET_KEY, HIGHLIGHT_HIDDEN_KEY,
    HIGHLIGHT_COLOR_KEY, HIGHLIGHT_START_KEY, HIGHLIGHT_END_KEY, HIGHLIGHT_TEXT_KEY,
    NodeData, HighlightContent
} from "../../common/model/matrix";

export type NodePointer = {
    node: Node,
    offset: number | undefined
}

type Path = number[]

function nodePath(node: Node): Path {
    let parent = node.parentNode;
    const indices = []
    while (parent) {
        indices.push(Array.prototype.indexOf.call(parent.childNodes, node));
        node = parent;
        parent = node.parentNode;
    }
    indices.reverse();
    return indices;
}

function comparePaths(path1: Path, path2: Path): number {
    for (let i = 0; i < path1.length && i < path2.length; i++) {
        if (path1[i] > path2[i]) return 1;
        if (path1[i] < path2[i]) return -1;
    }
    return Math.sign(path1.length - path2.length);
}

function recalculateOffset(node: Node, offset: number): NodePointer {
    if (isInserted(node)) {
        // Convert highlight nodes into offsets within text
        offset = 0;
    } else if (!(node instanceof Text)) {
        // Neither a highlight nor text node; we maintain
        // the invariant that highlights only contain other
        // highlights, so this isn't a part of a highlight,
        // and doesn't need to be adjusted.
        if (offset === node.childNodes.length) {
            offset = offset - 1;
        }
        return { node: node.childNodes[offset], offset: undefined }
    }

    while (node.parentNode && isInserted(node.parentNode)) {
        // TypeScript knows parent is not null here.
        const parent = node.parentNode;
        while (node.previousSibling) {
            node = node.previousSibling;
            offset += getLength(node);
        }
        node = parent;
    }
    return { node, offset }
}

function makeNodeData(node: Node, offset: number): NodeData {
    const { node: newNode, offset: newOffset } = recalculateOffset(node, offset);
    const pathObject: NodeData = {
        [HIGHLIGHT_NODE_PATH_KEY]: nodePath(newNode)
    };
    if (newOffset !== undefined) {
        pathObject[HIGHLIGHT_NODE_OFFSET_KEY] = newOffset;
    }
    return pathObject;
}

function pickSmaller(pathObj1: NodeData, pathObj2: NodeData) {
    const path1 = pathObj1[HIGHLIGHT_NODE_PATH_KEY];
    const path2 = pathObj2[HIGHLIGHT_NODE_PATH_KEY];
    const pathCmp = comparePaths(path1, path2);
    if (pathCmp !== 0) return pathCmp;

    const offset1 = pathObj1[HIGHLIGHT_NODE_OFFSET_KEY] || 0;
    const offset2 = pathObj2[HIGHLIGHT_NODE_OFFSET_KEY] || 0;
    return Math.sign(offset1 - offset2);
}

export function makeEvent(selection: Selection): Omit<HighlightContent, typeof HIGHLIGHT_COLOR_KEY> | null {
    if (selection.rangeCount !== 1 || selection.type !== "Range" || !selection.anchorNode || !selection.focusNode) {
        return null;
    }
    const anchorPath = makeNodeData(selection.anchorNode, selection.anchorOffset);
    const focusPath = makeNodeData(selection.focusNode, selection.focusOffset);
    const compare = pickSmaller(anchorPath, focusPath);
    let smaller, bigger;
    switch (compare) {
        case 1:
        case 0: // Begin and end with the same node without offset
            smaller = focusPath;
            bigger = anchorPath;
            break;
        case -1:
            smaller = anchorPath;
            bigger = focusPath;
            break;
        default:
            return null;
    }
    const smallNode = followPath(smaller[HIGHLIGHT_NODE_PATH_KEY], smaller[HIGHLIGHT_NODE_OFFSET_KEY]);
    const bigNode = followPath(bigger[HIGHLIGHT_NODE_PATH_KEY], bigger[HIGHLIGHT_NODE_OFFSET_KEY]);
    if (!smallNode || !bigNode) {
        return null;
    }
    let textPieces: string[] = [];
    iterateTextPieces(smallNode.node, smallNode.offset, bigNode.node, bigNode.offset, (node, from, to) => {
        textPieces.push(node.textContent?.substring(from, to) || "");
    });
    return {
        [HIGHLIGHT_TEXT_KEY]: textPieces,
        [HIGHLIGHT_START_KEY]: smaller,
        [HIGHLIGHT_END_KEY]: bigger,
        [HIGHLIGHT_HIDDEN_KEY]: false,
    }
}

export function decodeNodeData(data: NodeData): NodePointer | null {
    const offset = data[HIGHLIGHT_NODE_OFFSET_KEY]
    return followPath(data[HIGHLIGHT_NODE_PATH_KEY], offset);
}

function followPath(path: Path, offset: number | undefined): NodePointer | null {
    let node: Node | null = path.reduce((node, index) => node?.childNodes?.[index] || null, document.documentElement.parentNode as Node);
    if (!node) return null;
    if (!isInserted(node) || offset === undefined) return { node, offset };
    while (node && isInserted(node)) {
        node = node.childNodes[0];
        while (node && offset > getLength(node)) {
            offset -= getLength(node);
            node = node.nextSibling;
        }
    }
    return node && { node, offset }
}

function iterateText(fromNode: Node, toNode: Node, callback: (value: Text) => any): void {
    let currentNode: Node | null = fromNode;
    while (currentNode) {
        // If we're an element, descend further down.
        if (currentNode instanceof Element && currentNode.childNodes.length) {
            currentNode = currentNode.childNodes[0];
            continue;
        } else if (currentNode instanceof Text) {
            callback(currentNode);
        }
        
        // Move on to next node in the list
        while (currentNode && currentNode !== toNode && !currentNode.nextSibling) {
            currentNode = currentNode.parentNode;
        }
        if (currentNode === toNode) break;
        currentNode = currentNode && currentNode.nextSibling;
    }
}

export function iterateTextPieces(fromNode: Node, fromOffset: number | undefined, toNode: Node, toOffset: number | undefined, callback: (value: Text, from: number, to: number) => any): void {
    // Here, or elsewhere, do not assume that the assumptions regarding offset and text nodes
    // hold, just to be more robust. Elements might have an offset, text nodes might not.
    // Ensure both work.
    if (fromNode === toNode && fromNode instanceof Text &&
            fromOffset && fromNode instanceof Text &&
            toOffset && toNode instanceof Text) {
        callback(fromNode, fromOffset, toOffset);
    } else {
        iterateText(fromNode, toNode, textNode => {
            if (textNode === fromNode && fromOffset) {
                callback(textNode, fromOffset, textNode.textContent?.length || fromOffset);
            } else if (textNode === toNode && toOffset) {
                callback(textNode, 0, toOffset);
            } else {
                callback(textNode, 0, textNode.textContent?.length || 0);
            }
        });
    }
}
