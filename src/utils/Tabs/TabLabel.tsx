import React from "react";
import {TabProps} from "./Tab";
import "./TabLabel.scss";

export type TabLabelProps = TabProps & {
    onTabClick(key: string): void
    active: boolean
}

export class TabLabel extends React.Component<TabLabelProps, {}> {
    constructor(props: TabLabelProps) {
        super(props);
        this.handleTabClick = this.handleTabClick.bind(this);
    }

    handleTabClick() {
        this.props.onTabClick(this.props.tabId);
    }
    
    render() {
        return (
            <span className={`tab-button ${this.props.active ? 'active' : ''}`}
                onClick={this.handleTabClick}>
                <span className="tab-button-name">{this.props.tabTitle}</span>
            </span>
        )
    }
}
