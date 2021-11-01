import { useState, useEffect, useReducer } from 'react';
import './App.css';
import {Toolbar} from './Toolbar/Toolbar';
import {Menu}  from "./Menu/Menu";
import {AuthMenu} from "./Menu/AuthMenu/AuthMenu";
import {ToolsMenu} from "./Menu/ToolsMenu/ToolsMenu";
import {Tooltip} from "./Tooltip/Tooltip";
import {Highlight} from "./model";
import {Renderer} from "./effects/EffectfulRenderer";
import {Client, LocalStorage} from "./api/common";
import {MxsdkAuth} from "./api/mxsdk";
import {makeEvent} from "./effects/location";
import {HIGHLIGHT_COLOR_KEY} from "./model/matrix";
import {tooltipReducer, tooltipInitialState} from "./slices/tooltip";
import {highlightReducer, highlightInitialState} from "./slices/highlightData";

const Storage = new LocalStorage();
const Auth = new MxsdkAuth(Storage);

const App = () => {
    const [showMenu, setShowMenu] = useState(false);
    const [menuMode, setMenuMode] = useState<"auth" | "tools">("tools");
    const [authTab, setAuthTab] = useState<"login" | "signup">("login");
    const [toolsTab, setToolsTab] = useState<"quotes" | "rooms" | "users">("quotes");
    const [client, setClient] = useState<Client | null>(null);

    const [highlight, highlightDispatch] = useReducer(highlightReducer, highlightInitialState);
    const [tooltip, tooltipDispatch] = useReducer(tooltipReducer, tooltipInitialState);

    let status;
    if (client === null) {
        status = "logged-out";
    } else if (!highlight.currentRoomId) {
        status = "no-room";
    } else {
        const queuedMessages = highlight.page.getRoom(highlight.currentRoomId)?.localHighlights?.length !== 0;
        status = queuedMessages ? "queued" : "synced";
    }

    const createRoom = async () => {
        const url = window.location.href;
        await client?.createRoom(`Highlight room for ${url}.`, url);
    }

    const attmeptLogin = (username: string, password: string, homeserver: string) => {
        Auth.fromBasic(username, password, homeserver).then(c => {
            if (!c) return;
            setClient(c);
            setShowMenu(false);
        });
    }

    const makeNewHighlight = (color: string) => {
        if (!tooltip.selection || !highlight.currentRoomId || !client) return;
        const skeletonEvent = makeEvent(tooltip.selection);
        if (skeletonEvent) {
            const event = Object.assign(skeletonEvent, { [HIGHLIGHT_COLOR_KEY]: color });
            const txnId = parseInt(Storage.getString("txnId") || "0");
            Storage.setString("txnId", (txnId+1).toString());

            client.sendHighlight(highlight.currentRoomId, event, txnId);
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
        if (!highlight.currentRoomId || !client) return;

        if (typeof id === "string") client.setHighlightVisibility(highlight.currentRoomId, id, false);
        highlightDispatch({
            type: "change-visibility",
            roomId: highlight.currentRoomId,
            highlightId: id,
            visibility: false
        });
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
            addRoom(room) { highlightDispatch({ type: "add-room", room }); },
            highlight(roomId, highlight, txnId) {
                highlightDispatch({ type: "remote-highlight", roomId, highlight, txnId });
            },
            setHighlightVisibility(roomId, highlightId, visibility) {
                highlightDispatch({ type: "change-visibility", roomId, highlightId, visibility });
            }
        });
    }, [client, highlightDispatch]);
    
    useEffect(() => {
        Renderer.apply(highlight.page.getRoom(highlight.currentRoomId)?.highlights || []);
    });

    return !showMenu ?
        <>
            <Toolbar status={status} onOpenMenu={() => { setMenuMode("tools"); setShowMenu(true) }}/>
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
            <ToolsMenu modeId="tools" tab={toolsTab} onTabClick={setToolsTab} onCreateRoom={createRoom}
                onRoomSwitch={newId => highlightDispatch({ type: "switch-room", newId })}
                page={highlight.page} currentRoomId={highlight.currentRoomId}/>
        </Menu>;
}

export default App;
