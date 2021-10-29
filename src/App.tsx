import React, { useState } from 'react';
import './App.css';
import {Toolbar} from './Toolbar/Toolbar';
import {Menu}  from "./Menu/Menu";
import {Tooltip} from "./Tooltip/Tooltip";

const App = () => {
    const [showMenu, setShowMenu] = useState(false);
    const [menuMode, setMenuMode] = useState<"auth" | "tools">("tools");
    const [authTab, setAuthTab] = useState<"login" | "signup">("login");
    const [toolsTab, setToolsTab] = useState<"quotes" | "rooms" | "users">("quotes");

    return !showMenu ?
        <div><Toolbar onOpenMenu={() => setShowMenu(true) }/><Tooltip/></div> :
        <Menu mode={menuMode}
            toolsTab={toolsTab} onToolsTabClick={setToolsTab}
            authTab={authTab} onAuthTabClick={setAuthTab}
            onClose={() => setShowMenu(false)}/>;
}

export default App;
