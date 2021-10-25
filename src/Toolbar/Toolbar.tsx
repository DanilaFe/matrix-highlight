import React from "react";
import "./Toolbar.scss";
import { Cloud, Users, Folder } from "react-feather";

export type ToolbarProps = {
    onOpenMenu(): void
}

export const Toolbar = (props: ToolbarProps) => {
    return (
        <div className="toolbar-main">
            <button onClick={props.onOpenMenu}>⋯</button>
            <button onClick={props.onOpenMenu}><Cloud className="feather"/></button>
            <button onClick={props.onOpenMenu}><Users className="feather"/></button>
            <button onClick={props.onOpenMenu}><Folder className="feather"/></button>
        </div>
    );
}
