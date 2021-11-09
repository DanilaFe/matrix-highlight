import { useState, useEffect, useReducer } from 'react';
import {Toolbar} from './Toolbar/Toolbar';
import {Window}  from "./Window/Window";
import {ToolsMenu} from "./ToolsMenu/ToolsMenu";
import {Tooltip} from "./Tooltip/Tooltip";
import {FromContentEvent, ToContentEvent} from "../common/messages";
import {Highlight, HIGHLIGHT_COLOR_KEY} from "../common/model";
import {Renderer} from "./effects/EffectfulRenderer";
import {makeEvent} from "./effects/location";
import {tooltipReducer, tooltipInitialState} from "./slices/tooltip";
import {highlightReducer, highlightInitialState} from "./slices/highlightData";

export enum IndicatorStatus {
    NoRoom = "noRoom",
    Queued = "queued",
    Synced = "synced",
}

export function sendToBackground(event: FromContentEvent): Promise<void> {
    return new Promise(resolve => {
        chrome.runtime.sendMessage(event, () => resolve());
    });
}

const App = () => {
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
        await sendToBackground({ type: "create-room", name: `Highlight room for ${url}.`, url }); 
        setCreateRoomEnabled(true);
    }

    const joinRoom = async (roomId: string) => {
        await sendToBackground({ type: "join-room", roomId });
    }
    
    const leaveRoom = async (roomId: string) => {
        await sendToBackground({ type: "leave-room", roomId });
    }

    const inviteUser = async (roomId: string, userId: string) => {
        await sendToBackground({ type: "invite-user", roomId, userId });
    }

    const makeNewHighlight = async (color: string) => {
        if (!tooltip.selection || !highlight.currentRoomId) return;
        const skeletonEvent = makeEvent(tooltip.selection);
        if (skeletonEvent) {
            const event = Object.assign(skeletonEvent, { [HIGHLIGHT_COLOR_KEY]: color });
            const txnId = (await chrome.storage.sync.get([ "txnId" ]))["txnId"] || 0;
            await chrome.storage.sync.set({ txnId: txnId + 1 });

            sendToBackground({ type: "send-highlight", roomId: highlight.currentRoomId, highlight: event, txnId });
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
            sendToBackground({ type: "set-highlight-visibility",  roomId: highlight.currentRoomId, highlightId: id, visibility: false });
        }
        highlightDispatch({
            type: "highlight-visibility",
            roomId: highlight.currentRoomId,
            highlightId: id,
            visibility: false
        });
    }

    useEffect(() => {
        chrome.runtime.onMessage.addListener((message: ToContentEvent) => {
            highlightDispatch(message); 
        });
    }, [highlightDispatch]);

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
