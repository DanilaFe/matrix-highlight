import {Highlight} from "../../common/model";
import {MessageSquare} from "react-feather";
import {useContext} from "react";
import {AppContext} from "../AppContext";
import commonStyles from "../../common/common.scss";
import styles from "./QuoteList.scss";

export const QuoteButtons = (props: { highlight: Highlight }) => {
    if (props.highlight.messages.length === 0) return null;
    return (
        <div className={`${commonStyles.inputGroup} ${styles.inputGroup}`}>
            <button className={commonStyles.labeledIconButton}>
                <MessageSquare className={commonStyles.feather}/>{props.highlight.messages.length} Comments
            </button>
        </div>
    );
}

export const QuoteList = () => {
    const currentRoom = useContext(AppContext).currentRoom;

    if (!currentRoom) return <></>;

    const quoteViews = currentRoom.highlights.filter(hl => hl.visible).map(hl =>
        <div key={hl.id} className={`${styles.quote} ${hl.color}`}>
            <span className={styles.quoteColor}/>
            <div className={styles.quoteData}>
                <div>{hl.text.map(s => s.trim()).join(" ")}</div>
                <QuoteButtons highlight={hl}/>
            </div>
        </div>
    );
    return (
        <div className={styles.quoteList}>
            {quoteViews}
        </div>
    );
}
