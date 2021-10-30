import React, { useState, useEffect } from 'react';
import './App.css';
import {Toolbar} from './Toolbar/Toolbar';
import {Menu}  from "./Menu/Menu";
import {AuthMenu} from "./Menu/AuthMenu/AuthMenu";
import {ToolsMenu} from "./Menu/ToolsMenu/ToolsMenu";
import {Tooltip} from "./Tooltip/Tooltip";
import {Page} from "./model";
import {Renderer} from "./effects/EffectfulRenderer";
import {Authentication,Client} from "./api/common";

const test: Authentication = {
    async fromSaved() { return null; },
    async fromBasic() { return null; }
}

const App = () => {
    const [showMenu, setShowMenu] = useState(false);
    const [menuMode, setMenuMode] = useState<"auth" | "tools">("tools");
    const [authTab, setAuthTab] = useState<"login" | "signup">("login");
    const [toolsTab, setToolsTab] = useState<"quotes" | "rooms" | "users">("quotes");
    const [page] = useState(new Page({}));
    const [currentRoomId] = useState<string | null>(null);
    const [client, setClient] = useState<Client | null>(null);

    useEffect(() => {
        Renderer.setActiveListener(() => {});
    }, []);

    useEffect(() => {
        // Kick off authorization
        test.fromSaved().then(c => {
            if (c) {
                // Logged in from saved credentials
                setClient(c);
            } else {
                // Login failed; show auth tab.
                setMenuMode("auth");
                setShowMenu(true);
            }
        });;
    }, []);

    useEffect(() => {
        // Hook client whenever it changes.
        client?.subscribe({});
    }, [client]);
    
    useEffect(() => {
        Renderer.apply(page.getRoom(currentRoomId)?.highlights || []);
    });

    return !showMenu ?
        <div><Toolbar onOpenMenu={() => setShowMenu(true) }/><Tooltip/></div> :
        <Menu currentMode={menuMode} onClose={() => setShowMenu(false)}>
            <AuthMenu modeId="auth" tab={authTab} onTabClick={setAuthTab}
                attemptLogin={() => {}}
                attemptSignup={() => {}}/>
            <ToolsMenu modeId="tools" tab={toolsTab} onTabClick={setToolsTab}
                page={page} currentRoomId={currentRoomId}/>
        </Menu>;
}

export default App;
