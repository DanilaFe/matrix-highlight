import {Highlight} from "../../common/model";
import "./QuoteList.scss";
import {MessageSquare} from "react-feather";
import {useContext} from "react";
import {AppContext} from "../AppContext";

export const QuoteButtons = (props: { highlight: Highlight }) => {
    if (props.highlight.messages.length === 0) return null;
    return (
        <div className="input-group">
            <button className="labeled-icon-button">
                <MessageSquare className="feather"/>{props.highlight.messages.length} Comments
            </button>
        </div>
    );
}

export const QuoteList = () => {
    const currentRoom = useContext(AppContext).currentRoom;

    if (!currentRoom) return <></>;

    const quoteViews = currentRoom.highlights.filter(hl => hl.visible).map(hl =>
        <div key={hl.id} className={`quote ${hl.color}`}>
            <span className="quote-color"/>
            <div className="quote-data">
                <div className="quote-text">{hl.text.map(s => s.trim()).join(" ")}</div>
                <QuoteButtons highlight={hl}/>
            </div>
        </div>
    );
    return (
        <div className="quote-list">
            {quoteViews}
        </div>
    );
}
