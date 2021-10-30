import {Highlight} from "../../model";
import "./QuoteList.scss";

export type QuoteListProps = {
    highlights: Highlight[];
};

export const QuoteList = (props: QuoteListProps) => {
    const quoteViews = props.highlights.map(hl =>
        <div key={hl.id} className={`quote ${hl.color}`}>{hl.text.map(s => s.trim()).join(" ")}</div>
    );
    return (
        <div className="quote-list">
            {quoteViews}
        </div>
    );
}
