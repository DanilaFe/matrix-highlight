import React, { useState, useEffect, useReducer } from 'react';
import './App.css';
import {Toolbar} from './Toolbar/Toolbar';
import {Menu}  from "./Menu/Menu";
import {AuthMenu} from "./Menu/AuthMenu/AuthMenu";
import {ToolsMenu} from "./Menu/ToolsMenu/ToolsMenu";
import {Tooltip} from "./Tooltip/Tooltip";
import {Page, Highlight} from "./model";
import {Renderer} from "./effects/EffectfulRenderer";
import {Client, LocalStorage} from "./api/common";
import {MxsdkAuth} from "./api/mxsdk";
import {produce} from "immer";
import {makeEvent} from "./effects/location";
import {HIGHLIGHT_COLOR_KEY} from "./model/matrix";

const Storage = new LocalStorage();
const Auth = new MxsdkAuth(Storage);

type TooltipState = {
    selection: Selection | null;
    target: string | number | null;
    visible: boolean;
    top: number;
    left: number;
};

type TooltipEvent
    = { type: "selection", selection: Selection | null }
    | { type: "click", id: string | number, top: number, left: number }
    | { type: "resize-selection" }
    | { type: "resize-clicked", id: string | number, top: number, left: number }
    | { type: "hide" }

const selectionCoords = (selection: Selection) => {
    const rect = selection.getRangeAt(0).getBoundingClientRect();
    return { left: rect.left + window.scrollX, top: rect.top + window.scrollY };
}

const tooltipReducer = (state: TooltipState, event: TooltipEvent): TooltipState => {
    if (event.type === "selection") {
        const selection = event.selection;
        if (!selection || selection.type !== "Range" || selection.toString() === "") {
            return { ...state, visible: false, selection };
        }
        const { top, left } = selectionCoords(selection);
        return { ...state, target: null, visible: true, top, left, selection };
    } else if (event.type === "click") {
        return { ...state, visible: true, target: event.id, top: event.top, left: event.left };
    } else if (event.type === "resize-selection") {
        if (!state.selection || state.target !== null) return state;
        const { top, left } = selectionCoords(state.selection);
        return { ...state, top, left };
    } else if (event.type === "resize-clicked") {
        if (event.id !== state.target) return state;
        return { ...state, top: event.top, left: event.left };
    } else if (event.type === "hide") {
        return { ...state, visible: false };
    }
    return state;
}

const App = () => {
    const [showMenu, setShowMenu] = useState(false);
    const [menuMode, setMenuMode] = useState<"auth" | "tools">("tools");
    const [authTab, setAuthTab] = useState<"login" | "signup">("login");
    const [toolsTab, setToolsTab] = useState<"quotes" | "rooms" | "users">("quotes");
    const [page, setPage] = useState(new Page({}));
    const [currentRoomId, setCurrentRoomId] = useState<string | null>("!PvZRbsyWNPNzYhDvxz:matrix.org");
    const [client, setClient] = useState<Client | null>(null);

    const [tooltip, tooltipDispatch] = useReducer(tooltipReducer, {
        selection: null,
        target: null,
        visible: false,
        top: 0,
        left: 0
    });

    const attmeptLogin = (username: string, password: string, homeserver: string) => {
        Auth.fromBasic(username, password, homeserver).then(c => {
            if (!c) return;
            setClient(c);
            setShowMenu(false);
        });
    }

    const makeNewHighlight = (color: string) => {
        if (!tooltip.selection || !currentRoomId || !client) return;
        const skeletonEvent = makeEvent(tooltip.selection);
        if (skeletonEvent) {
            const event = Object.assign(skeletonEvent, { [HIGHLIGHT_COLOR_KEY]: color });
            const txnId = parseInt(Storage.getString("txnId") || "0");
            Storage.setString("txnId", (txnId+1).toString());

            client.sendHighlight(currentRoomId, event, txnId);
            setPage(produce(page, draft => {
                draft.changeRoom(currentRoomId, room => {
                    room.addLocalHighlight(new Highlight(txnId, event));
                });
            }));

            window.getSelection()?.removeAllRanges();
            tooltipDispatch({type: "hide"});
        }
    }

    const hideHighlight = (id: string | number) => {
        if (!currentRoomId || !client) return;

        if (typeof id === "string") client.setHighlightVisibility(currentRoomId, id, false);
        setPage(produce(page, draft => {
            draft.changeRoom(currentRoomId, room => {
                room.setHighlightVisibility(id,  false);
            });
        }));
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
        // Kick off authorization
        Auth.fromSaved().then(c => {
            if (c) {
                // Logged in from saved credentials
                setClient(c);
            } else {
                // Login failed; show auth tab.
                setMenuMode("auth");
                setShowMenu(true);
            }
        });
    }, []);

    useEffect(() => {
        // Hook client whenever it changes.
        client?.subscribe({
            addRoom(room) {
                setPage(page => produce(page, draft => draft.addRoom(room)));
                if (!currentRoomId) setCurrentRoomId(room.id);
            },
            highlight(roomId, highlight, txnId) {
                setPage(page => produce(page, draft => {
                    draft.changeRoom(roomId, room => {
                        room.addRemoteHighlight(highlight, txnId);
                    });
                }));
            },
            setHighlightVisibility(roomId, highlightId, visibility) {
                setPage(page => produce(page, draft => {
                    draft.changeRoom(roomId, room => {
                        room.setHighlightVisibility(highlightId, visibility);
                    });
                }));
            }
        });
    }, [client]);
    
    useEffect(() => {
        Renderer.apply(page.getRoom(currentRoomId)?.highlights || []);
    });

    return !showMenu ?
        <>
            <Toolbar onOpenMenu={() => setShowMenu(true) }/>
            {tooltip.visible ?
                <Tooltip
                    target={tooltip.target}
                    hide={hideHighlight}
                    highlight={makeNewHighlight}
                    top={tooltip.top} left={tooltip.left}/> :
                null}
        </> :
        <Menu currentMode={menuMode} onClose={() => setShowMenu(false)}>
            <AuthMenu modeId="auth" tab={authTab} onTabClick={setAuthTab}
                attemptLogin={attmeptLogin}
                attemptSignup={() => {}}/>
            <ToolsMenu modeId="tools" tab={toolsTab} onTabClick={setToolsTab}
                onRoomSwitch={setCurrentRoomId}
                page={page} currentRoomId={currentRoomId}/>
        </Menu>;
}

export default App;
