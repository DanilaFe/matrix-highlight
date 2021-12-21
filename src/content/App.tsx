import { useState, useEffect, useReducer } from 'react';
import {Toolbar} from './Toolbar/Toolbar';
import {Window}  from "./Window/Window";
import {ToolsMenu} from "./ToolsMenu/ToolsMenu";
import {AuthMenu} from "./AuthMenu/AuthMenu";
import {Tooltip} from "./Tooltip/Tooltip";
import {PORT_TAB, PORT_RENEW, FromContentMessage, ToContentMessage} from "../common/messages";
import {Highlight, Message, HIGHLIGHT_COLOR_KEY, HIGHLIGHT_TEXT_KEY, COLORS} from "../common/model";
import {Renderer} from "./effects/EffectfulRenderer";
import {makeEvent} from "./effects/location";
import {tooltipReducer, tooltipInitialState} from "./slices/tooltip";
import {highlightReducer, highlightInitialState} from "./slices/highlightData";
import {authReducer, authInitialState} from "./slices/auth";

export enum IndicatorStatus {
    NoLogin = "noLogin",
    NoSync = "noSync",
    NoRoom = "noRoom",
    Queued = "queued",
    Synced = "synced",
}

export function sendToBackground(port: chrome.runtime.Port | null, event: FromContentMessage): void {
    port?.postMessage(event);
}

async function freshTxnId(): Promise<number> {
    const txnId = (await chrome.storage.sync.get([ "txnId" ]))["txnId"] || 0;
    await chrome.storage.sync.set({ txnId: txnId + 1 });
    return txnId;
}

function openPort(str: typeof PORT_TAB | typeof PORT_RENEW, setPort: (port: chrome.runtime.Port) => void, highlightDispatch: (event: ToContentMessage) => void, authDispatch: (event: ToContentMessage) => void): void {
    const port = chrome.runtime.connect({ name: str });
    setPort(port);
    port.onDisconnect.addListener(() => {
        openPort(PORT_RENEW, setPort, highlightDispatch, authDispatch) /* Do not retrieve all data on reconnect */
    });
    port.onMessage.addListener((message: ToContentMessage) => {
        // response(true);
        highlightDispatch(message); 
        authDispatch(message);
    });
};

const App = () => {
    const [port, setPort] = useState<chrome.runtime.Port | null>(null);

    const [showMenu, setShowMenu] = useState(false);
    const [createRoomEnabled, setCreateRoomEnabled] = useState(true);
    const [toolsTab, setToolsTab] = useState<"quotes" | "rooms" | "users">("rooms");
    const [authTab, setAuthTab] = useState<"login" | "signup">("login");

    const [highlight, highlightDispatch] = useReducer(highlightReducer, highlightInitialState);
    const [tooltip, tooltipDispatch] = useReducer(tooltipReducer, tooltipInitialState);
    const [auth, authDispatch] = useReducer(authReducer, authInitialState);

    let status: IndicatorStatus
    if (!auth.userId) {
        status = IndicatorStatus.NoLogin;
    } else if (!highlight.syncComplete) {
        status = IndicatorStatus.NoSync;
    } else if (!highlight.currentRoomId) {
        status = IndicatorStatus.NoRoom;
    } else if (highlight.page.getRoom(highlight.currentRoomId)?.localHighlights?.length !== 0) {
        status = IndicatorStatus.Queued;
    } else {
        status = IndicatorStatus.Synced;
    }

    const openTools = (tab: "quotes" | "rooms" | "users") => {
        if (!auth.userId) {
            authDispatch({ type: "set-show-login", showLogin: true });
        }
        setToolsTab(tab)
        setShowMenu(true);
    }

    const handleIndicator = () => {
        switch (status) {
            case IndicatorStatus.NoLogin: authDispatch({ type: "set-show-login", showLogin: true }); return;
            case IndicatorStatus.NoRoom: openTools("rooms"); return;
            default: return;
        }
    };

    const createRoom = async () => {
        const url = window.location.href;
        setCreateRoomEnabled(false);
        sendToBackground(port, { type: "create-room", name: `Highlight room for ${url}.`, url }); 
        setCreateRoomEnabled(true);
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

    const hideHighlight = (id: string | number) => {
        if (!highlight.currentRoomId) return;

        if (typeof id === "string") {
            sendToBackground(port, { type: "set-highlight-visibility",  roomId: highlight.currentRoomId, highlightId: id, visibility: false });
        }
        tooltipDispatch({ type: "hide" });
        highlightDispatch({
            type: "highlight-visibility",
            roomId: highlight.currentRoomId,
            highlightId: id,
            visibility: false
        });
    }

    const setHighlightColor = (id : string | number, color: typeof COLORS[number]) => {
        if (!highlight.currentRoomId) return;
        const existingHighlight = highlight.page.getRoom(highlight.currentRoomId)?.highlights.find(hl => hl.id == id);
        if (!existingHighlight) return;

        const newContent = { ...existingHighlight.content, [HIGHLIGHT_COLOR_KEY]: color };
        if (typeof id === "string") {
            sendToBackground(port, { type: "edit-highlight", roomId: highlight.currentRoomId, highlightId: id, highlight: newContent });
        }
        highlightDispatch({
            type: "highlight-content",
            roomId: highlight.currentRoomId,
            highlightId: id,
            highlight: newContent
        });
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
            openPort(PORT_RENEW, setPort, highlightDispatch, authDispatch);
            port?.disconnect();
        }, 1000 * 60 * 4);
    }, [port, setPort, highlightDispatch]);

    useEffect(() => {
        openPort(PORT_TAB, setPort, highlightDispatch, authDispatch);
    }, [setPort, highlightDispatch]);

    useEffect(() => {
        Renderer.subscribe({
            activeChange(id) { highlightDispatch({ type: "set-active", id }) },
            click(id, top, left, bottom) { tooltipDispatch({ type: "click", id, top, left, bottom }); },
            move(id, top, left, bottom) { tooltipDispatch({ type: "resize-clicked", id, top, left, bottom }); }
        });
    }, [tooltipDispatch]);

    useEffect(() => {
        document.addEventListener("keydown", (e) => {
            if (e.key !== "Escape") return;
            setShowMenu(false);
            authDispatch({ type: "set-show-login", showLogin: false });
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
    }, [tooltipDispatch]);

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

    if (!showMenu && !auth.showLogin) {
        const toolbarComp = 
            <Toolbar status={status} onIndicatorClick={handleIndicator}
                onShowQuotes={() => openTools("quotes")}
                onShowRooms={() => openTools("rooms")}
                onShowUsers={() => openTools("users")}/>;
        const tooltipComp = tooltip.visible ?
            <Tooltip
                target={highlight.page.getRoom(highlight.currentRoomId)?.highlights.find(hl => hl.id === tooltip.target) || null}
                users={highlight.page.getRoom(highlight.currentRoomId)?.users || []}
                hide={hideHighlight}
                reply={sendReply}
                changeColor={setHighlightColor}
                highlight={makeNewHighlight}
                top={tooltip.top} left={tooltip.left} bottom={tooltip.bottom}/> :
            null;
        return <>{toolbarComp}{tooltipComp}</>;
    } else if (auth.showLogin) {
        return (
            <Window onClose={() => setShowMenu(false)}>
                 <AuthMenu authEnabled={!auth.loginInProgress} tab={authTab} onTabClick={setAuthTab}
                     attemptLogin={attemptLogin} attemptSignup={() => {}}
                     loginError={auth.loginError}/>
            </Window>
        );
    } else {
        return (
            <Window onClose={() => setShowMenu(false)}>
                <ToolsMenu createRoomEnabled={createRoomEnabled} tab={toolsTab} onTabClick={setToolsTab} onCreateRoom={createRoom}
                    onRoomSwitch={switchRoom}
                    onJoinRoom={joinRoom} onIgnoreRoom={leaveRoom} onInviteUser={inviteUser}
                    page={highlight.page} currentRoomId={highlight.currentRoomId}/> :
            </Window>
        );
    }
}

export default App;
