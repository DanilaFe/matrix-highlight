import React from "react";
import "./Tab.scss"

export type TabProps = {
    tabId: string,
    tabTitle: string
}

export class Tab extends React.Component<TabProps, {}> {
    render() {
        return (
            <div className="tab">
                <h2>{this.props.tabTitle}</h2>
                { this.props.children }
            </div>
        );
    }
}
