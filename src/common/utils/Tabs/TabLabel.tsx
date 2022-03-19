import React from "react";
import {TabProps} from "./Tab";
import styles from "./TabLabel.scss";

export type TabLabelProps = TabProps & {
    onTabClick(key: string): void
    active: boolean
}

export const TabLabel = (props: TabLabelProps) => {
    return (
        <span className={`${styles.tabButton} ${props.active ? styles.active : ''}`}
            onClick={() => props.onTabClick(props.tabId)}>
            <span className={styles.tabButtonName}>{props.tabTitle}</span>
        </span>
    );
}
