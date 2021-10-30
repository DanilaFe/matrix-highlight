import React from "react"
import "./Menu.scss";
import {Window} from "./Window";

export type MenuProps = {
    currentMode: string;
    children: React.ReactElement[];
    onClose(): void;
}

export const Menu = (props: MenuProps) => {
    return (
        <Window onClose={props.onClose}>
            {props.children.find(c => c.props.modeId === props.currentMode)}
        </Window>
    );
}
