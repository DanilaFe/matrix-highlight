import {createContext} from "react"

export type ToolsMenuTab = "create" | "join" | "invites" | "suggested" | "settings" | "users" | "quotes" | "comments";

export type ToolsMenuState = {
    tab: ToolsMenuTab | null;
    openTab(tab: ToolsMenuTab | null): void;
    showInvites: boolean;
};

export const ToolsMenuContext = createContext<ToolsMenuState>({ tab: null, openTab: () => {}, showInvites: false });
