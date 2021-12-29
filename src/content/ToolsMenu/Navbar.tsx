import {useContext} from "react";
import {ToolsMenuContext} from "./ToolsMenuContext";
import {AppContext} from "../AppContext";
import {ArrowLeft} from "react-feather";
import "./Navbar.scss";

export const NavBar = (props: { title: string, subtitle: string }) => {
    const { openTab } = useContext(ToolsMenuContext);
    return (
        <nav>
            <ArrowLeft className="feather" onClick={() => openTab(null)}/>
            <div className="nav-text">
                <h1>{props.title}</h1>
                <span>{props.subtitle}</span>
            </div>
        </nav>
    );
}

export const RoomNavBar = (props: { title: string }) => {
    const { currentRoom } = useContext(AppContext);
    return <NavBar title={props.title} subtitle={`For room: "${currentRoom?.name || ""}"`}/>;
}

