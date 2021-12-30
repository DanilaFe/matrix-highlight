import { ReactElement, useState, useEffect, useReducer } from 'react';
import {Toolbar} from './Toolbar/Toolbar';
import {Window}  from "./Window/Window";
import {ToolsMenu, ToolsMenuTab} from "./ToolsMenu/ToolsMenu";
import {ToolsMenuContext} from "./ToolsMenu/ToolsMenuContext";
import {AuthMenu} from "./AuthMenu/AuthMenu";
import {Tooltip} from "./Tooltip/Tooltip";
import {PORT_TAB, PORT_RENEW, FromContentMessage, ToContentMessage} from "../common/messages";
import {Highlight, HighlightContent, Message, HIGHLIGHT_COLOR_KEY, HIGHLIGHT_HIDDEN_KEY, COLORS} from "../common/model";
import {Renderer} from "./effects/EffectfulRenderer";
import {makeEvent} from "./effects/location";
import {tooltipReducer, tooltipInitialState} from "./slices/tooltip";
import {highlightReducer, highlightInitialState, HighlightDataState} from "./slices/highlightData";
import {toolsMenuReducer, toolsMenuInitialState} from "./slices/toolsMenu";
import {authReducer, authInitialState, AuthState} from "./slices/auth";
import * as browser from "webextension-polyfill";
import {AppContext} from "./AppContext";

export enum IndicatorStatus {
    NoLogin = "noLogin",
    NoSync = "noSync",
    NoRoom = "noRoom",
    Queued = "queued",
    Synced = "synced",
}

export function sendToBackground(port: browser.Runtime.Port | null, event: FromContentMessage): void {
    port?.postMessage(event);
}

async function freshTxnId(): Promise<number> {
    const txnId = (await browser.storage.local.get([ "txnId" ]))["txnId"] || 0;
    await browser.storage.local.set({ txnId: txnId + 1 });
    return txnId;
}

function openPort(str: typeof PORT_TAB | typeof PORT_RENEW, setPort: (port: browser.Runtime.Port) => void, dispatch: (event: ToContentMessage) => void): void {
    const port = browser.runtime.connect({ name: str });
    setPort(port);
    port.onDisconnect.addListener(() => {
        openPort(PORT_RENEW, setPort, dispatch) /* Do not retrieve all data on reconnect */
    });
    port.onMessage.addListener((message: ToContentMessage) => {
        // response(true);
        dispatch(message);
    });
};

function getIndicatorStatus(auth: AuthState, highlight: HighlightDataState): IndicatorStatus {
    if (!auth.userId) {
        return IndicatorStatus.NoLogin;
    } else if (!highlight.syncComplete) {
        return IndicatorStatus.NoSync;
    } else if (!highlight.currentRoomId) {
        return IndicatorStatus.NoRoom;
    } else if (highlight.page.getRoom(highlight.currentRoomId)?.localHighlights?.length !== 0) {
        return IndicatorStatus.Queued;
    } else {
        return IndicatorStatus.Synced;
    }
}

const App = () => {
    const [port, setPort] = useState<browser.Runtime.Port | null>(null);

    const [toolsMenu, toolsMenuDispatch] = useReducer(toolsMenuReducer, toolsMenuInitialState);
    const [highlight, highlightDispatch] = useReducer(highlightReducer, highlightInitialState);
    const [tooltip, tooltipDispatch] = useReducer(tooltipReducer, tooltipInitialState);
    const [auth, authDispatch] = useReducer(authReducer, authInitialState);

    const messageDispatch = (message: ToContentMessage) => {
        toolsMenuDispatch(message);
        highlightDispatch(message);
        authDispatch(message);
    }

    const currentRoom = highlight.page.getRoom(highlight.currentRoomId);
    const status: IndicatorStatus = getIndicatorStatus(auth, highlight);

    const closeMenu = () => {
        toolsMenuDispatch({ type: "set-show-menu", showMenu: false });
        toolsMenuDispatch({ type: "set-show-login", showLogin: false });
    };

    const setAuthTab = (authTab: "login" | "signup") => {
        toolsMenuDispatch({ type: "set-auth-tab", authTab });
    }

    const openTools = (tab: ToolsMenuTab | null) => {
        if (!auth.userId) {
            toolsMenuDispatch({ type: "set-show-login", showLogin: true });
        }
        toolsMenuDispatch({ type: "set-tab", tab });
        toolsMenuDispatch({ type: "set-show-menu", showMenu: true });
    }

    const handleIndicator = () => {
        switch (status) {
            case IndicatorStatus.NoLogin: toolsMenuDispatch({ type: "set-show-login", showLogin: true }); return;
            case IndicatorStatus.NoRoom: openTools(null); return;
            default: return;
        }
    };

    const createRoom = async (roomName: string) => {
        const url = window.location.href;
        highlightDispatch({ type: "create-room" });
        sendToBackground(port, { type: "create-room", name: roomName, url }); 
    }

    const joinRoom = async (roomId: string) => {
        sendToBackground(port, { type: "join-room", roomId });
    }
    
    const leaveRoom = async (roomId: string) => {
        sendToBackground(port, { type: "leave-room", roomId });
    }

    const inviteUser = async (roomId: string, userId: string) => {
        sendToBackground(port, { type: "invite-user", roomId, userId });
    }

    const makeNewHighlight = async (color: string) => {
        if (!tooltip.selection || !highlight.currentRoomId) return;
        const skeletonEvent = makeEvent(tooltip.selection);
        if (skeletonEvent) {
            const event = Object.assign(skeletonEvent, { [HIGHLIGHT_COLOR_KEY]: color });
            const txnId = await freshTxnId();

            sendToBackground(port, { type: "send-highlight", roomId: highlight.currentRoomId, highlight: event, txnId });
            highlightDispatch({
                type: "local-highlight",
                highlight: new Highlight(txnId, event),
                roomId: highlight.currentRoomId
            });

            window.getSelection()?.removeAllRanges();
            tooltipDispatch({type: "hide"});
        }
    }

    const updateHighlight = (id : string | number, transform: (event: HighlightContent) => HighlightContent) => {
        if (!highlight.currentRoomId) return;
        const existingHighlight = highlight.page.getRoom(highlight.currentRoomId)?.highlights.find(hl => hl.id == id);
        if (!existingHighlight) return;

        const newContent = transform(existingHighlight.content);
        if (typeof id === "string") {
            sendToBackground(port, { type: "edit-highlight", roomId: highlight.currentRoomId, highlightId: id, highlight: newContent });
        }
        highlightDispatch({
            type: "highlight-content",
            roomId: highlight.currentRoomId,
            highlightId: id,
            highlight: newContent
        });
    };

    const hideHighlight = (id: string | number) => {
        updateHighlight(id, content => ({ ...content, [HIGHLIGHT_HIDDEN_KEY]: true }));
        tooltipDispatch({ type: "hide" });
    }

    const setHighlightColor = (id : string | number, color: typeof COLORS[number]) => {
        updateHighlight(id, content => ({ ...content, [HIGHLIGHT_COLOR_KEY]: color }));
    }

    const sendReply = async (id: string | number, plainBody: string, formattedBody: string) => {
        if (!auth.userId || !highlight.currentRoomId) return;
        if (typeof(id) !== "string") return;
        
        const txnId = await freshTxnId();
        const localMessage = new Message({
            id: txnId,
            userId: auth.userId,
            plainBody, formattedBody
        });
        highlightDispatch({ type: "local-message", roomId: highlight.currentRoomId, threadId: id, message: localMessage });
        sendToBackground(port, { type: "send-thread-message", roomId: highlight.currentRoomId, threadId: id, txnId, plainBody, formattedBody });
    }

    const attemptLogin = async (username: string, password: string, homeserver: string) => {
        authDispatch({type: "begin-login-attempt"});
        sendToBackground(port, { type: "attempt-login", username, password, homeserver });
    }

    const switchRoom = (roomId: string) => {
        highlightDispatch({ type: "switch-room", newId: roomId })
    }

    useEffect(() => {
        if (!highlight.currentRoomId) return;
        sendToBackground(port, { type: "load-room", roomId: highlight.currentRoomId });
    }, [highlight.currentRoomId]);

    useEffect(() => {
        setTimeout(() => {
            openPort(PORT_RENEW, setPort, messageDispatch);
            port?.disconnect();
        }, 1000 * 60 * 4);
    }, [port, setPort, highlightDispatch, authDispatch, toolsMenuDispatch]);

    useEffect(() => {
        openPort(PORT_TAB, setPort, messageDispatch);
    }, [setPort, highlightDispatch, authDispatch, toolsMenuDispatch]);

    useEffect(() => {
        Renderer.subscribe({
            activeChange(id) { highlightDispatch({ type: "set-active", id }) },
            click(id, top, left, bottom) { tooltipDispatch({ type: "click", id, top, left, bottom }); },
            move(id, top, left, bottom) { tooltipDispatch({ type: "resize-clicked", id, top, left, bottom }); }
        });
    }, [highlightDispatch, tooltipDispatch]);

    useEffect(() => {
        document.addEventListener("keydown", (e) => {
            if (e.key !== "Escape") return;
            toolsMenuDispatch({ type: "set-show-menu", showMenu: false });
            toolsMenuDispatch({ type: "set-show-login", showLogin: false });
        });
        document.addEventListener("selectionchange", (e) => {
            const selection = window.getSelection();
            if (!selection || selection.type !== "Range" || selection.toString() === "") {
                tooltipDispatch({ type: "selection", selection: null });
            }
        });
        document.addEventListener("mouseup", (e) => {
            tooltipDispatch({ type: "hide" });
            tooltipDispatch({ type: "selection", selection: window.getSelection() });
            e.stopPropagation();
        });
    }, [toolsMenuDispatch, tooltipDispatch]);

    useEffect(() => {
        const updateTooltip = () => {
            tooltipDispatch({ type: "resize-selection" });
        };
        window.addEventListener("resize", updateTooltip)
        return () => {
            window.removeEventListener("resize", updateTooltip);
        }
    }, [tooltipDispatch]);

    useEffect(() => {
        Renderer.apply(highlight.page.getRoom(highlight.currentRoomId)?.highlights || []);
    });

    const wrapInProviders = (element: ReactElement) => {
        return (
            <AppContext.Provider value={{ page: highlight.page, currentRoom, currentUserId: auth.userId }}>
                <ToolsMenuContext.Provider value={{ tab: toolsMenu.tab, openTab: openTools, showInvites: highlight.page.invitedRooms.length !== 0 }}>
                    {element}
                </ToolsMenuContext.Provider>
            </AppContext.Provider>
        );
    };

    if (!toolsMenu.showMenu && !toolsMenu.showLogin) {
        const toolbarComp = 
            <Toolbar status={status} onIndicatorClick={handleIndicator}/>;
        const tooltipComp = tooltip.visible ?
            <Tooltip
                target={currentRoom?.highlights?.find(hl => hl.id === tooltip.target) || null}
                hide={hideHighlight}
                reply={sendReply}
                changeColor={setHighlightColor}
                highlight={makeNewHighlight}
                top={tooltip.top} left={tooltip.left} bottom={tooltip.bottom}/> :
            null;
        return wrapInProviders(<>{toolbarComp}{tooltipComp}</>);
    } else if (toolsMenu.showLogin) {
        return wrapInProviders(
            <Window onClose={closeMenu}>
                 <AuthMenu authEnabled={!auth.loginInProgress} tab={toolsMenu.authTab} onTabClick={setAuthTab}
                     attemptLogin={attemptLogin} attemptSignup={() => {}}
                     loginError={auth.loginError}/>
            </Window>
        );
    } else {
        return wrapInProviders(
            <Window onClose={closeMenu}>
                <ToolsMenu createRoomEnabled={!highlight.creatingRoom} 
                    onSelectRoom={switchRoom} onCreateRoom={createRoom}
                    onJoinRoom={joinRoom} onIgnoreRoom={leaveRoom} onInviteUser={inviteUser}/> :
            </Window>
        );
    }
}

export default App;
