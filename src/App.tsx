import React from 'react';
import './App.css';
import {Toolbar} from './Toolbar/Toolbar';

type AppState = {
    showMenu: boolean;
}

class App extends React.Component<{}, AppState> {
    constructor(props: {}) {
        super(props);
        this.state = { showMenu: false }
        this.handleOpenMenu = this.handleOpenMenu.bind(this);
    }

    handleOpenMenu() {
        this.setState({ ...this.state, showMenu: true });
    }

    render() {
        return !this.state.showMenu ? <Toolbar onOpenMenu={this.handleOpenMenu}/> : null;
    }
}

export default App;
