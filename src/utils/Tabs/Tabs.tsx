import React from "react";
import {TabLabel} from "./TabLabel";
import "./Tabs.scss";

export type TabsProps = {
    currentTab: string;
    onTabClick(tabId: string): void;
    children: React.ReactElement[]
}

export class Tabs extends React.Component<TabsProps, {}> {
    render() {
        const tabLabels = this.props.children.map(child =>
            <TabLabel
                key={child.props.tabId}
                tabId={child.props.tabId}
                tabTitle={child.props.tabTitle}
                active={child.props.tabId === this.props.currentTab}
                onTabClick={this.props.onTabClick}
            />);
        return (
            <div className="tabs">
                <nav>{tabLabels}</nav>
                {this.props.children.find(child => child.props.tabId === this.props.currentTab)}
            </div>
        )
    }
}
