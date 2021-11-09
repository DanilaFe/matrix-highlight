import React from "react";
import {TabLabel} from "./TabLabel";
import "./Tabs.scss";

export type TabsProps = {
    currentTab: string;
    onTabClick(tabId: string): void;
    children: React.ReactElement[]
}

export const Tabs = (props: TabsProps) => {
    const tabLabels = props.children.map(child =>
        <TabLabel
            key={child.props.tabId}
            tabId={child.props.tabId}
            tabTitle={child.props.tabTitle}
            active={child.props.tabId === props.currentTab}
            onTabClick={props.onTabClick}
        />);
    return (
        <div className="tabs">
            <nav>{tabLabels}</nav>
            {props.children.find(child => child.props.tabId === props.currentTab)}
        </div>
    );
}
