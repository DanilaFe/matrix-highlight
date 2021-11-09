import { useState, useEffect, useReducer } from 'react';
import {Toolbar} from './Toolbar/Toolbar';
import {Window}  from "./Window/Window";
import {ToolsMenu} from "./ToolsMenu/ToolsMenu";
import {Tooltip} from "./Tooltip/Tooltip";
import {Highlight, HIGHLIGHT_COLOR_KEY} from "../common/model";
import {Renderer} from "./effects/EffectfulRenderer";
import {makeEvent} from "./effects/location";
import {tooltipReducer, tooltipInitialState} from "./slices/tooltip";
import {highlightReducer, highlightInitialState} from "./slices/highlightData";

export enum IndicatorStatus {
    LoggedOut = "loggedOut",
    NoRoom = "noRoom",
    Queued = "queued",
    Synced = "synced",
}

const App = () => {
    const [showMenu, setShowMenu] = useState(false);
    const [menuMode, setMenuMode] = useState<"auth" | "tools">("tools");

    const [authEnabled, setAuthEnabled] = useState(true);
    const [authTab, setAuthTab] = useState<"login" | "signup">("login");

    const [createRoomEnabled, setCreateRoomEnabled] = useState(true);
    const [toolsTab, setToolsTab] = useState<"quotes" | "rooms" | "users">("quotes");

    const [highlight, highlightDispatch] = useReducer(highlightReducer, highlightInitialState);
    const [tooltip, tooltipDispatch] = useReducer(tooltipReducer, tooltipInitialState);

    let status: IndicatorStatus
    if (1 === null) {
        status = IndicatorStatus.LoggedOut;
    } else if (!highlight.currentRoomId) {
        status = IndicatorStatus.NoRoom;
    } else if (!highlight.currentRoomId ||
        highlight.page.getRoom(highlight.currentRoomId)?.localHighlights?.length !== 0) {
        status = IndicatorStatus.Queued;
    } else {
        status = IndicatorStatus.Synced;
    }

    const openAuth = (tab: "login" | "signup") => {
        setMenuMode("auth");
        setAuthTab(tab);
        setShowMenu(true);
    };

    const openTools = (tab: "quotes" | "rooms" | "users") => {
        setMenuMode("tools");
        setToolsTab(tab);
        setShowMenu(true);
    }

    const handleIndicator = () => {
        switch (status) {
            case IndicatorStatus.LoggedOut: openAuth("login"); return;
            case IndicatorStatus.NoRoom: openTools("rooms"); return;
            default: return;
        }
    };

    const createRoom = async () => {
        // TODO Stub
        // const url = window.location.href;
        // setCreateRoomEnabled(false);
        // await client?.createRoom(`Highlight room for ${url}.`, url);
        // setCreateRoomEnabled(true);
    }

    const joinRoom = async (roomId: string) => {
        // TODO Stub
        // console.log("Joining room!");
        // await client?.joinRoom(roomId);
    }
    
    const leaveRoom = async (roomId: string) => {
        // TODO Stub
        // await client?.leaveRoom(roomId);
    }

    const inviteUser = async (roomId: string, userId: string) => {
        // TODO Stub
        // await client?.inviteUser(roomId, userId);
    }

    const makeNewHighlight = (color: string) => {
        // TODO Stub
        // if (!tooltip.selection || !highlight.currentRoomId || !client) return;
        // const skeletonEvent = makeEvent(tooltip.selection);
        // if (skeletonEvent) {
        //     const event = Object.assign(skeletonEvent, { [HIGHLIGHT_COLOR_KEY]: color });
        //     const txnId = parseInt(Storage.getString("txnId") || "0");
        //     Storage.setString("txnId", (txnId+1).toString());

        //     client.sendHighlight(highlight.currentRoomId, event, txnId);
        //     highlightDispatch({
        //         type: "local-highlight",
        //         highlight: new Highlight(txnId, event),
        //         roomId: highlight.currentRoomId
        //     });

        //     window.getSelection()?.removeAllRanges();
        //     tooltipDispatch({type: "hide"});
        // }
    }

    const hideHighlight = (id: string | number) => {
        // TODO Stub
        // if (!highlight.currentRoomId || !client) return;

        // if (typeof id === "string") client.setHighlightVisibility(highlight.currentRoomId, id, false);
        // highlightDispatch({
        //     type: "change-visibility",
        //     roomId: highlight.currentRoomId,
        //     highlightId: id,
        //     visibility: false
        // });
    }

    useEffect(() => {
        Renderer.subscribe({
            activeChange(id) {},
            click(id, top, left) {
                tooltipDispatch({ type: "click", id, top, left });
            },
            move(id, top, left) {
                tooltipDispatch({ type: "resize-clicked", id, top, left });
            }
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
                onOpenMenu={() => { setMenuMode("tools"); setShowMenu(true) }}
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
