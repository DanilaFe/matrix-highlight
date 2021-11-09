export type TooltipState = {
    selection: Selection | null;
    target: string | number | null;
    visible: boolean;
    top: number;
    left: number;
};

export type TooltipEvent
    = { type: "selection", selection: Selection | null }
    | { type: "click", id: string | number, top: number, left: number }
    | { type: "resize-selection" }
    | { type: "resize-clicked", id: string | number, top: number, left: number }
    | { type: "hide" }

const selectionCoords = (selection: Selection) => {
    const rect = selection.getRangeAt(0).getBoundingClientRect();
    return { left: rect.left + window.scrollX, top: rect.top + window.scrollY };
}

export const tooltipReducer = (state: TooltipState, event: TooltipEvent): TooltipState => {
    if (event.type === "selection") {
        const selection = event.selection;
        if (!selection || selection.type !== "Range" || selection.toString() === "") {
            return { ...state, visible: false, selection };
        }
        const { top, left } = selectionCoords(selection);
        return { ...state, target: null, visible: true, top, left, selection };
    } else if (event.type === "click") {
        return { ...state, visible: true, target: event.id, top: event.top, left: event.left };
    } else if (event.type === "resize-selection") {
        if (!state.selection || state.target !== null) return state;
        const { top, left } = selectionCoords(state.selection);
        return { ...state, top, left };
    } else if (event.type === "resize-clicked") {
        if (event.id !== state.target) return state;
        return { ...state, top: event.top, left: event.left };
    } else if (event.type === "hide") {
        return { ...state, visible: false };
    }
    return state;
}

export const tooltipInitialState = {
    selection: null,
    target: null,
    visible: false,
    top: 0,
    left: 0
};
