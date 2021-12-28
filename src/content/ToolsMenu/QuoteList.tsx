import {Highlight} from "../../common/model";
import "./QuoteList.scss";
import {MessageSquare} from "react-feather";

export type QuoteListProps = {
    highlights: readonly Highlight[];
};

export const QuoteButtons = (props: { hl: Highlight }) => {
    if (props.hl.messages.length === 0) return null;
    return (
        <div className="input-group">
            <button className="labeled-icon-button">
                <MessageSquare className="feather"/>{props.hl.messages.length} Comments
            </button>
        </div>
    );
}

export const QuoteList = (props: QuoteListProps) => {
    const quoteViews = props.highlights.filter(hl => hl.visible).map(hl =>
        <div key={hl.id} className={`quote ${hl.color}`}>
            <span className="quote-color"/>
            <div className="quote-data">
                <div className="quote-text">{hl.text.map(s => s.trim()).join(" ")}</div>
                <QuoteButtons hl={hl}/>
            </div>
        </div>
    );
    return (
        <div className="quote-list">
            {quoteViews}
        </div>
    );
}
