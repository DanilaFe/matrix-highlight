import {Message, User} from "../../common/model";
import sanitizeHtml from 'sanitize-html';

export type CommentProps = {
    message: Message;
    users: User[];
};

export const Comment = (props: CommentProps) => {
    const user = props.users.find(u => u.id === props.message.userId);
    return (
        <div className="comment" key={props.message.id}>
            <div className="sender">{user?.name || props.message.userId}:</div>
            { props.message.formattedBody ?
                <div dangerouslySetInnerHTML={{__html: sanitizeHtml(props.message.formattedBody) }}></div> :
                <p>{props.message.plainBody}</p> }
        </div>
    );
}
