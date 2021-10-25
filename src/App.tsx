import React, { useState } from 'react';
import './App.css';
import {Toolbar} from './Toolbar/Toolbar';
import {Menu}  from "./Menu/Menu";

const App = () => {
    const [showMenu, setShowMenu] = useState(false);
    const [authTab, setAuthTab] = useState<"login" | "signup">("login");

    return !showMenu ?
        <Toolbar onOpenMenu={() => setShowMenu(true) }/> :
        <Menu currentTab={authTab} onTabClick={setAuthTab} onClose={() => setShowMenu(false)}/>;
}

export default App;
