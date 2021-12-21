import {Highlight} from "../../common/model";
import "./QuoteList.scss";

export type QuoteListProps = {
    highlights: readonly Highlight[];
};

export const QuoteList = (props: QuoteListProps) => {
    const quoteViews = props.highlights.filter(hl => hl.visible).map(hl =>
        <div key={hl.id} className={`quote ${hl.color}`}>{hl.text.map(s => s.trim()).join(" ")}</div>
    );
    return (
        <div className="quote-list">
            {quoteViews}
        </div>
    );
}
