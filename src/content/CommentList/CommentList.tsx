import {Message} from "../../common/model";
import {Comment} from "./Comment";
import "./CommentList.scss";

export type CommentListProps = {
    messages: readonly Message[];
}

export const CommentList = (props: CommentListProps) => {
    if (props.messages.length === 0) {
        return <div className="no-comments">No comments yet</div>;
    }
    const comments = props.messages.map(m => <Comment message={m}/>);
    return <div className="comment-list">{comments}</div>;
}
