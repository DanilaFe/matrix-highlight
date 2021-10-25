import React from "react";
import {TabProps} from "./Tab";
import "./TabLabel.scss";

export type TabLabelProps = TabProps & {
    onTabClick(key: string): void
    active: boolean
}

export const TabLabel = (props: TabLabelProps) => {
    return (
        <span className={`tab-button ${props.active ? 'active' : ''}`}
            onClick={() => props.onTabClick(props.tabId)}>
            <span className="tab-button-name">{props.tabTitle}</span>
        </span>
    );
}
