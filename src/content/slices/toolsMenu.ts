import {ToContentMessage} from "../../common/messages";
import {ToolsMenuTab} from "../ToolsMenu/ToolsMenuContext";

export type ToolsMenuState = {
    showMenu: boolean;
    showLogin: boolean;
    tab: ToolsMenuTab | null;
    authTab: "login" | "signup";
};

export type ToolsMenuEvent = ToContentMessage
    | { type: "set-show-menu", showMenu: boolean }
    | { type: "set-show-login", showLogin: boolean }
    | { type: "set-tab", tab: ToolsMenuTab | null }
    | { type: "set-auth-tab", authTab: "login" | "signup" }

export const toolsMenuReducer = (state: ToolsMenuState, event: ToolsMenuEvent) => {
    const newState = Object.assign({}, state);
    if (event.type === "set-show-menu") {
        newState.showMenu = event.showMenu;
    } else if (event.type === "set-show-login") {
        newState.showLogin = event.showLogin;
    } else if (event.type === "set-tab") {
        newState.tab = event.tab;
    }  else if (event.type === "set-auth-tab") {
        newState.authTab = event.authTab;
    } else if (event.type === "logged-in") {
        newState.showLogin = false;
    }
    return newState;
}

export const toolsMenuInitialState = {
    showMenu: false,
    showLogin: false,
    tab: null,
    authTab: "login" as const
}
