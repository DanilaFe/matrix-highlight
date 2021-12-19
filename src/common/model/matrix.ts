export const COLORS = ["yellow", "pink", "green", "blue", "orange" ] as const;

export const HIGHLIGHT_EVENT_TYPE = "com.danilafe.highlight";
export const HIGHLIGHT_PAGE_EVENT_TYPE = "com.danilafe.highlight_page";
export const HIGHLIGHT_HIDE_EVENT_TYPE = "com.danilafe.highlight_hide";

export const HIGHLIGHT_EDIT_MARKER_KEY = "com.danilafe.highlight_edit";

export const HIGHLIGHT_PAGE_KEY = "com.danilafe.page_url";

export const HIGHLIGHT_NODE_PATH_KEY = "com.danilafe.node_path";
export const HIGHLIGHT_NODE_OFFSET_KEY = "com.danilafe.node_offset";

export type NodeData = {
    [HIGHLIGHT_NODE_PATH_KEY]: number[],
    [HIGHLIGHT_NODE_OFFSET_KEY]?: number
};

export const HIGHLIGHT_START_KEY = "com.danilafe.highlight_start";
export const HIGHLIGHT_END_KEY = "com.danilafe.highlight_end";
export const HIGHLIGHT_COLOR_KEY = "com.danilafe.highlight_color";
export const HIGHLIGHT_TEXT_KEY = "com.danilafe.highlight_text";

export type HighlightContent = {
    [HIGHLIGHT_START_KEY]: NodeData,
    [HIGHLIGHT_END_KEY]: NodeData,
    [HIGHLIGHT_COLOR_KEY]: string
    [HIGHLIGHT_TEXT_KEY]: string[]
}

export const HIGHLIGHT_HIDDEN_KEY = "com.danilafe.hidden";

export type HiddenContent = {
    [HIGHLIGHT_HIDDEN_KEY]: boolean
}
