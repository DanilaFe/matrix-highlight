import React from "react";
import "./Toolbar.scss";
import { Cloud, Users, Folder } from "react-feather";

export type ToolbarProps = {
    onOpenMenu(): void
}

export class Toolbar extends React.Component<ToolbarProps, {}> {
    render() {
        return (
            <div className="toolbar-main">
                <button onClick={this.props.onOpenMenu}>⋯</button>
                <button onClick={this.props.onOpenMenu}><Cloud className="feather"/></button>
                <button onClick={this.props.onOpenMenu}><Users className="feather"/></button>
                <button onClick={this.props.onOpenMenu}><Folder className="feather"/></button>
            </div>
        );
    }
}
