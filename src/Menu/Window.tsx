import React from "react"
import {COLORS} from "../constants";
import { X } from "react-feather";

export const Window = (props: React.PropsWithChildren<{onClose(): void }>) => {
    return (
        <div className="menu">
            <div className="title">
                {COLORS.map(color => <span key={color} className={`${color} color-dot`}></span>)}
                <span className="title-text">Matrix Highlight</span>
                <X className="close-button" onClick={props.onClose}/>
            </div>
            {props.children}
        </div>
    );
}
