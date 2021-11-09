import React from "react";
import "./Toolbar.scss";
import { IndicatorStatus } from "../App";
import { UserX, Folder, UploadCloud, Cloud, Users, AlertTriangle, AlignLeft, Settings } from "react-feather";

export type ToolbarProps = {
    status: IndicatorStatus;
    onOpenMenu(): void;
    onShowQuotes(): void;
    onShowRooms(): void;
    onShowUsers(): void;
    onIndicatorClick(): void;
}

function statusToIcon(status: string) {
    switch (status) {
        case IndicatorStatus.NoRoom: return <AlertTriangle className="feather"/>;
        case IndicatorStatus.Queued: return <UploadCloud className="feather"/>
        default: return <Cloud className="feather"/>
    }
}

export const Toolbar = (props: ToolbarProps) => {
    // <button onClick={props.onOpenMenu}>⋯</button>
    return (
        <div className="toolbar-main">
            <button><Settings className="feather"/></button>
            <button onClick={props.onShowQuotes}><AlignLeft className="feather"/></button>
            <button onClick={props.onShowRooms}><Folder className="feather"/></button>
            <button onClick={props.onShowUsers}><Users className="feather"/></button>
            <span className="spacer"/>
            <button onClick={props.onIndicatorClick}>{statusToIcon(props.status)}</button>
        </div>
    );
}
