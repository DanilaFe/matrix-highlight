import React from "react"
import {COLORS} from "../../common/model/matrix";
import { X } from "react-feather";
import styles from "./Window.scss";

export const Window = (props: React.PropsWithChildren<{onClose(): void }>) => {
    return (
        <div className={styles.window}>
            <div className={styles.title}>
                {COLORS.map(color => <span key={color} className={`${color} ${styles.colorDot}`}></span>)}
                <span className={styles.titleText}>Matrix Highlight</span>
                <X className={styles.closeButton} onClick={props.onClose}/>
            </div>
            {props.children}
        </div>
    );
}
