import React, { useState } from 'react';
import './App.css';
import {Toolbar} from './Toolbar/Toolbar';
import {Menu}  from "./Menu/Menu";
import {Tooltip} from "./Tooltip/Tooltip";
import {Room,Page, Highlight} from "./model";

const App = () => {
    const [showMenu, setShowMenu] = useState(false);
    const [menuMode, setMenuMode] = useState<"auth" | "tools">("tools");
    const [authTab, setAuthTab] = useState<"login" | "signup">("login");
    const [toolsTab, setToolsTab] = useState<"quotes" | "rooms" | "users">("quotes");
    const [page, setPage] = useState(new Page({}));

    return !showMenu ?
        <div><Toolbar onOpenMenu={() => setShowMenu(true) }/><Tooltip/></div> :
        <Menu mode={menuMode} page={page}
            toolsTab={toolsTab} onToolsTabClick={setToolsTab}
            authTab={authTab} onAuthTabClick={setAuthTab}
            onClose={() => setShowMenu(false)}/>;
}

export default App;
