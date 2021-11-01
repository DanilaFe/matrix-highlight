import React from "react";
import "./Toolbar.scss";
import { UserX, Folder, UploadCloud, Cloud, Users, AlertTriangle } from "react-feather";

export type ToolbarProps = {
    status: string;
    onOpenMenu(): void;
}

function statusToIcon(status: string) {
    switch (status) {
        case "logged-out": return <UserX className="feather"/>;
        case "no-room": return <AlertTriangle className="feather"/>;
        case "queued": return <UploadCloud className="feather"/>
        default: return <Cloud className="feather"/>
    }
}

export const Toolbar = (props: ToolbarProps) => {
    return (
        <div className="toolbar-main">
            <button onClick={props.onOpenMenu}>⋯</button>
            <button onClick={props.onOpenMenu}><Users className="feather"/></button>
            <button onClick={props.onOpenMenu}><Folder className="feather"/></button>
            <span className="spacer"/>
            <button onClick={props.onOpenMenu}>{statusToIcon(props.status)}</button>
        </div>
    );
}
