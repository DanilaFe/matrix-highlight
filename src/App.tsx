import React, { useState, useEffect } from 'react';
import './App.css';
import {Toolbar} from './Toolbar/Toolbar';
import {Menu}  from "./Menu/Menu";
import {Tooltip} from "./Tooltip/Tooltip";
import {Page} from "./model";
import {Renderer} from "./effects/EffectfulRenderer";

const App = () => {
    const [showMenu, setShowMenu] = useState(false);
    const [menuMode] = useState<"auth" | "tools">("tools");
    const [authTab, setAuthTab] = useState<"login" | "signup">("login");
    const [toolsTab, setToolsTab] = useState<"quotes" | "rooms" | "users">("quotes");
    const [page] = useState(new Page({}));
    const [currentRoomId] = useState<string | null>(null);

    useEffect(() => {
        Renderer.setActiveListener(() => {});
    }, []);
    
    useEffect(() => {
        Renderer.apply(page.getRoom(currentRoomId)?.highlights || []);
    });

    return !showMenu ?
        <div><Toolbar onOpenMenu={() => setShowMenu(true) }/><Tooltip/></div> :
        <Menu mode={menuMode} page={page} currentRoomId={currentRoomId}
            toolsTab={toolsTab} onToolsTabClick={setToolsTab}
            authTab={authTab} onAuthTabClick={setAuthTab}
            onClose={() => setShowMenu(false)}/>;
}

export default App;
