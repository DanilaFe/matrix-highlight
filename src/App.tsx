import React, { useState, useEffect } from 'react';
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

const App = () => {
    const [showMenu, setShowMenu] = useState(false);
    const [menuMode, setMenuMode] = useState<"auth" | "tools">("tools");
    const [authTab, setAuthTab] = useState<"login" | "signup">("login");
    const [toolsTab, setToolsTab] = useState<"quotes" | "rooms" | "users">("quotes");
    const [page, setPage] = useState(new Page({}));
    const [currentRoomId, setCurrentRoomId] = useState<string | null>("!PvZRbsyWNPNzYhDvxz:matrix.org");
    const [client, setClient] = useState<Client | null>(null);
    const [selection, setSelection] = useState<Selection | null>(null);

    const [tooltipTarget, setTooltipTarget] = useState<string | number | null>(null);
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipTop, setTooltipTop] = useState(0);
    const [tooltipLeft, setTooltipLeft] = useState(0);

    const updateTooltipPos = (selection: Selection) => {
        const rect = selection.getRangeAt(0).getBoundingClientRect()
        setTooltipLeft(rect.left + window.scrollX);
        setTooltipTop(rect.top + window.scrollY);
    };

    const updateSelection = (selection: Selection | null) => {
        setSelection(selection);
        if (!selection || selection.type !== "Range" || selection.toString() === "") {
            setShowTooltip(false);
            return;
        }
        updateTooltipPos(selection);
        setTooltipTarget(null);
        setShowTooltip(true);
    }

    const attmeptLogin = (username: string, password: string, homeserver: string) => {
        Auth.fromBasic(username, password, homeserver).then(c => {
            if (!c) return;
            setClient(c);
            setShowMenu(false);
        });
    }

    const makeNewHighlight = (color: string) => {
        if (!selection || !currentRoomId || !client) return;
        const skeletonEvent = makeEvent(selection);
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
            setSelection(null);
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
                setTooltipTop(top);
                setTooltipLeft(left);
                setTooltipTarget(id);
                setShowTooltip(true);
            }
        });
    }, []);

    useEffect(() => {
        document.addEventListener("selectionchange", (e) => {
            const selection = window.getSelection();
            if (!selection || selection.type !== "Range" || selection.toString() === "") {
                updateSelection(null);
            }
        });
        document.addEventListener("mouseup", (e) => {
            updateSelection(window.getSelection());
            e.stopPropagation();
        });
    }, []);

    useEffect(() => {
        const updateTooltip = () => {
            if (selection) updateTooltipPos(selection);
        };
        window.addEventListener("resize", updateTooltip)
        return () => {
            window.removeEventListener("resize", updateTooltip);
        }
    }, [selection]);

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
            {showTooltip ?
                <Tooltip
                    target={tooltipTarget}
                    hide={hideHighlight}
                    highlight={makeNewHighlight}
                    top={tooltipTop} left={tooltipLeft}/> :
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
