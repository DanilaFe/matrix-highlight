import {createContext} from "react"

export type ToolsMenuTab = "create" | "join" | "invites" | "settings" | "users" | "quotes" | "comments";

export type ToolsMenuState = {
    tab: ToolsMenuTab | null;
    showInvites: boolean;
    setTab(tab: ToolsMenuTab | null): void;
};

export const ToolsMenuContext = createContext<ToolsMenuState>({ tab: null, showInvites: false, setTab: () => {}});
