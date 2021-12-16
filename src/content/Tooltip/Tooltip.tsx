import {useState, PropsWithChildren, SyntheticEvent} from "react";
import {Highlight, User} from "../../common/model";
import {COLORS} from "../../common/model/matrix";
import "./Tooltip.scss";
import {Trash, MessageSquare} from "react-feather";
import {Editor, EditorState, RichUtils, getDefaultKeyBinding, KeyBindingUtil, ContentState} from "draft-js";
const {hasCommandModifier} = KeyBindingUtil;

export enum TooltipMode {
    Click = "click",
    Reply = "reply",
};

export type TooltipProps = {
    left: number;
    top: number;
    bottom: number;
    target: Highlight | null;
    users: User[];
    mode: TooltipMode;
    highlight: (color: string) => void;
    hide: (id: string | number) => void;
    reply: (id: string | number) => void;
    sendReply: (id: string | number, plainBody: string, formattedBody: string) => void;
}

export const SEND_COMMAND = 'draft-editor-send';

/* No idea where to get SyntheticKeyboardEvent. */
function keyBindingFn(e: Parameters<typeof hasCommandModifier>[0]) {
    if (e.code === "Enter" && !e.shiftKey) {
        return SEND_COMMAND;
    }
    return getDefaultKeyBinding(e); 
}

const DraftEditor = (props: { sendReply(plain: string, formatted: string): void }) => {
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const [focused, setFocused] = useState(false);
  const handleKeyCommand = (command: string, editorState: EditorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
        setEditorState(newState);
        return 'handled';
    } else if (command === SEND_COMMAND) {
        const plainText = editorState.getCurrentContent().getPlainText();
        props.sendReply(plainText, plainText);
        setEditorState(EditorState.push(editorState, ContentState.createFromText(""), 'remove-range'));
        return 'handled'
    }
    return 'not-handled';
  }
  return <div className={`editor ${focused ? "focused" : ""}`}><Editor keyBindingFn={keyBindingFn} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} editorState={editorState} onChange={setEditorState} handleKeyCommand={handleKeyCommand}/></div>;
}

const SmallTooltip = (props: PropsWithChildren<TooltipProps>) => {
    return <div className="tooltip"
        style={{ left: props.left, top: (props.top - 40) }}
        onMouseUp={e => e.stopPropagation()}>{props.children}</div>;
}

const LargeTooltip = (props: PropsWithChildren<TooltipProps>) => {
    return <div className="tooltip large"
        style={{ left: props.left, top: props.bottom }}
        onMouseUp={e => e.stopPropagation()}>{props.children}</div>;
}

export const Tooltip = (props: TooltipProps) => {
    if (!props.target) {
        const highlightButtons = COLORS.map(color =>
                <button onClick={() => props.highlight(color)} key={color} className={`${color} color-switch`}/>);
        return <SmallTooltip {...props}>{highlightButtons}</SmallTooltip>;
    } else if (props.mode === TooltipMode.Click) {
        return (
            <SmallTooltip {...props}>
                <button className="destructive"
                    onClick={() => props.hide(props.target!.id)}><Trash/></button>
                <button
                    onClick={() => props.reply(props.target!.id)}><MessageSquare/></button>
            </SmallTooltip>
        );
    }
    const comments = props.target!.messages.map(msg =>
        <div className="comment" key={msg.id}>
            <div className="sender">{props.users.find(u => u.id === msg.userId)?.name || msg.userId}:</div>
            {msg.plainBody}
        </div>
    );
    return (
        <LargeTooltip {...props}>
            <h3>Comments</h3> 
            {comments.length === 0 ? <div className="no-comments">No comments yet</div> : <div className="comment-list">{comments}</div>}
            <span className="notice">Leave a comment</span>
            <DraftEditor sendReply={(plain, formatted) => props.sendReply(props.target!.id, plain, formatted) }/>
        </LargeTooltip>
    );
}
