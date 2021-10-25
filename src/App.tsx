import React from 'react';
import './App.css';
import {Toolbar} from './Toolbar/Toolbar';
import {Menu}  from "./Menu/Menu";

type AppState = {
    showMenu: boolean;
    authTab: "login" | "signup";
}

class App extends React.Component<{}, AppState> {
    constructor(props: {}) {
        super(props);
        this.state = { showMenu: false, authTab: "login" }
        this.handleOpenMenu = this.handleOpenMenu.bind(this);
        this.handleAuthTab = this.handleAuthTab.bind(this);
        this.handleCloseMenu = this.handleCloseMenu.bind(this);
    }

    handleOpenMenu() {
        this.setState({ ...this.state, showMenu: true });
    }

    handleAuthTab(tab: "login" | "signup") {
        this.setState({ ...this.state, authTab: tab });
    }

    handleCloseMenu() {
        this.setState({ ...this.state, showMenu: false });
    }

    render() {
        return !this.state.showMenu ?
            <Toolbar onOpenMenu={this.handleOpenMenu}/> :
            <Menu currentTab={this.state.authTab} onTabClick={this.handleAuthTab} onClose={this.handleCloseMenu}/>;
    }
}

export default App;
