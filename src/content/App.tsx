import { useState, useEffect, useReducer } from 'react';
import {Toolbar} from './Toolbar/Toolbar';
import {Window}  from "./Window/Window";
import {ToolsMenu} from "./ToolsMenu/ToolsMenu";
import {Tooltip} from "./Tooltip/Tooltip";
import {PORT_TAB, PORT_RENEW, FromContentMessage, ToContentMessage} from "../common/messages";
import {Highlight, HIGHLIGHT_COLOR_KEY, HIGHLIGHT_TEXT_KEY} from "../common/model";
import {Renderer} from "./effects/EffectfulRenderer";
import {makeEvent} from "./effects/location";
import {tooltipReducer, tooltipInitialState} from "./slices/tooltip";
import {highlightReducer, highlightInitialState} from "./slices/highlightData";

export enum IndicatorStatus {
    NoRoom = "noRoom",
    Queued = "queued",
    Synced = "synced",
}

export function sendToBackground(port: chrome.runtime.Port | null, event: FromContentMessage): void {
    if (!port) console.log("No port :(");
    port?.postMessage(event);
}

function openPort(str: typeof PORT_TAB | typeof PORT_RENEW, setPort: (port: chrome.runtime.Port) => void, highlightDispatch: (event: ToContentMessage) => void): void {
    const port = chrome.runtime.connect({ name: str });
    setPort(port);
    port.onDisconnect.addListener(() => {
        openPort(PORT_RENEW, setPort, highlightDispatch) /* Do not retrieve all data on reconnect */
    });
    port.onMessage.addListener((message: ToContentMessage) => {
        // response(true);
        highlightDispatch(message); 
    });
};

const App = () => {
    const [port, setPort] = useState<chrome.runtime.Port | null>(null);

    const [showMenu, setShowMenu] = useState(false);
    const [createRoomEnabled, setCreateRoomEnabled] = useState(true);
    const [toolsTab, setToolsTab] = useState<"quotes" | "rooms" | "users">("quotes");

    const [highlight, highlightDispatch] = useReducer(highlightReducer, highlightInitialState);
    const [tooltip, tooltipDispatch] = useReducer(tooltipReducer, tooltipInitialState);

    let status: IndicatorStatus
    if (!highlight.currentRoomId) {
        status = IndicatorStatus.NoRoom;
    } else if (!highlight.currentRoomId ||
        highlight.page.getRoom(highlight.currentRoomId)?.localHighlights?.length !== 0) {
        status = IndicatorStatus.Queued;
    } else {
        status = IndicatorStatus.Synced;
    }

    const openTools = (tab: "quotes" | "rooms" | "users") => {
        setToolsTab(tab)
        setShowMenu(true);
    }

    const handleIndicator = () => {
        switch (status) {
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
            const txnId = (await chrome.storage.sync.get([ "txnId" ]))["txnId"] || 0;
            await chrome.storage.sync.set({ txnId: txnId + 1 });

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
        highlightDispatch({
            type: "highlight-visibility",
            roomId: highlight.currentRoomId,
            highlightId: id,
            visibility: false
        });
    }

    useEffect(() => {
        setTimeout(() => {
            openPort(PORT_RENEW, setPort, highlightDispatch);
            port?.disconnect();
        }, 1000 * 60 * 4);
    }, [port, setPort, highlightDispatch]);

    useEffect(() => {
        openPort(PORT_TAB, setPort, highlightDispatch);
    }, [setPort, highlightDispatch]);

    useEffect(() => {
        Renderer.subscribe({
            activeChange(id) {},
            click(id, top, left) { tooltipDispatch({ type: "click", id, top, left }); },
            move(id, top, left) { tooltipDispatch({ type: "resize-clicked", id, top, left }); }
        });
    }, [tooltipDispatch]);

    useEffect(() => {
        document.addEventListener("keydown", (e) => {
            if (e.key !== "Escape") return;
            setShowMenu(false);
        });
        document.addEventListener("selectionchange", (e) => {
            const selection = window.getSelection();
            if (!selection || selection.type !== "Range" || selection.toString() === "") {
                tooltipDispatch({ type: "selection", selection: null });
            }
        });
        document.addEventListener("mouseup", (e) => {
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

    return !showMenu ?
        <>
            <Toolbar status={status} onIndicatorClick={handleIndicator}
                onOpenMenu={() => { setShowMenu(true) }}
                onShowQuotes={() => openTools("quotes")}
                onShowRooms={() => openTools("rooms")}
                onShowUsers={() => openTools("users")}
                />
            {tooltip.visible ?
                <Tooltip
                    target={tooltip.target}
                    hide={hideHighlight}
                    highlight={makeNewHighlight}
                    top={tooltip.top} left={tooltip.left}/> :
                null}
        </> :
        <Window onClose={() => setShowMenu(false)}>
            <ToolsMenu modeId="tools" createRoomEnabled={createRoomEnabled} tab={toolsTab} onTabClick={setToolsTab} onCreateRoom={createRoom}
                onRoomSwitch={newId => highlightDispatch({ type: "switch-room", newId })}
                onJoinRoom={joinRoom} onIgnoreRoom={leaveRoom} onInviteUser={inviteUser}
                page={highlight.page} currentRoomId={highlight.currentRoomId}/>
        </Window>;
}

export default App;
