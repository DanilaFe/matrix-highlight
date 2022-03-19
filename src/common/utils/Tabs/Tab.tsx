import React from "react";
import styles from "./Tab.scss"

export type TabProps = {
    tabId: string,
    tabTitle: string
}

export const Tab = (props: React.PropsWithChildren<TabProps>) => {
    return (
        <div className={styles.tab}>
            <h2>{props.tabTitle}</h2>
            { props.children }
        </div>
    );
}
