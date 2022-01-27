import "./Toolbar.scss";
import { IndicatorStatus } from "../App";
import { UserX, Folder, UploadCloud, Cloud, Users, AlertTriangle, AlignLeft, Settings, Clock, MessageSquare} from "react-feather";
import {ToolsMenuContext} from "../ToolsMenu/ToolsMenuContext";
import {useContext} from "react";

export type ToolbarProps = {
    status: IndicatorStatus;
    onIndicatorClick(): void;
}

function statusToIcon(status: string) {
    switch (status) {
        case IndicatorStatus.NoLogin: return <UserX className="feather"/>;
        case IndicatorStatus.NoSync: return <Clock className="feather"/>;
        case IndicatorStatus.NoRoom: return <AlertTriangle className="feather"/>;
        case IndicatorStatus.Queued: return <UploadCloud className="feather"/>
        default: return <Cloud className="feather"/>
    }
}

export const Toolbar = (props: ToolbarProps) => {
    const { openTab } = useContext(ToolsMenuContext);
    return (
        <div className="toolbar-main">
            <button><Settings className="feather"/></button>
            <button onClick={() => openTab(null) }><Folder className="feather"/></button>
            <button onClick={() => openTab("users") }><Users className="feather"/></button>
            <button onClick={() => openTab("quotes") }><AlignLeft className="feather"/></button>
            <button><MessageSquare className="feather"/></button>
            <span className="spacer"/>
            <button onClick={props.onIndicatorClick}>{statusToIcon(props.status)}</button>
        </div>
    );
}
