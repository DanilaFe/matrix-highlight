import React from "react";
import "./Tab.scss"

export type TabProps = {
    tabId: string,
    tabTitle: string
}

export const Tab = (props: React.PropsWithChildren<TabProps>) => {
    return (
        <div className="tab">
            <h2>{props.tabTitle}</h2>
            { props.children }
        </div>
    );
}
