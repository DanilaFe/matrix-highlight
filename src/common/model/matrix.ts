export const COLORS = ["yellow", "pink", "green", "blue", "orange" ] as const;

export const HIGHLIGHT_EVENT_TYPE = "com.danilafe.highlight";
export const HIGHLIGHT_STATE_EVENT_TYPE = "com.danilafe.highlight.state";
export const HIGHLIGHT_EDIT_EVENT_TYPE = "com.danilafe.highlight_edit";
export const HIGHLIGHT_EDIT_REL_TYPE = "com.danilafe.highlight_edit";
export const HIGHLIGHT_PAGE_KEY = "com.danilafe.highlight_page";

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
export const HIGHLIGHT_HIDDEN_KEY = "com.danilafe.highlight_hidden";

export type HighlightContent = {
    [HIGHLIGHT_START_KEY]: NodeData,
    [HIGHLIGHT_END_KEY]: NodeData,
    [HIGHLIGHT_COLOR_KEY]: string,
    [HIGHLIGHT_TEXT_KEY]: string[],
    [HIGHLIGHT_HIDDEN_KEY]: boolean
}

export const HIGHLIGHT_NEW_HIGHLIGHT_KEY = "com.danilafe.new_highlight";
