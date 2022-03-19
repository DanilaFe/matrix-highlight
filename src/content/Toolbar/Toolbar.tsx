import { IndicatorStatus } from "../App";
import { UserX, Folder, UploadCloud, Cloud, Users, AlertTriangle, AlignLeft, Settings, Clock, MessageSquare} from "react-feather";
import {ToolsMenuContext} from "../ToolsMenu/ToolsMenuContext";
import {useContext} from "react";
import styles from "./Toolbar.scss";

export type ToolbarProps = {
    status: IndicatorStatus;
    onIndicatorClick(): void;
}

function statusToIcon(status: string) {
    switch (status) {
        case IndicatorStatus.NoLogin: return <UserX className={styles.feather}/>;
        case IndicatorStatus.NoSync: return <Clock className={styles.feather}/>;
        case IndicatorStatus.NoRoom: return <AlertTriangle className={styles.feather}/>;
        case IndicatorStatus.Queued: return <UploadCloud className={styles.feather}/>
        default: return <Cloud className={styles.feather}/>
    }
}

export const Toolbar = (props: ToolbarProps) => {
    const { openTab } = useContext(ToolsMenuContext);
    return (
        <div className={styles.toolbarMain}>
            <button><Settings className={styles.feather}/></button>
            <button onClick={() => openTab(null) }><Folder className={styles.feather}/></button>
            <button onClick={() => openTab("users") }><Users className={styles.feather}/></button>
            <button onClick={() => openTab("quotes") }><AlignLeft className={styles.feather}/></button>
            <button><MessageSquare className={styles.feather}/></button>
            <span className={styles.spacer}/>
            <button onClick={props.onIndicatorClick}>{statusToIcon(props.status)}</button>
        </div>
    );
}
