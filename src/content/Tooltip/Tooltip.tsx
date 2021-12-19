import {useState, PropsWithChildren, SyntheticEvent} from "react";
import {Highlight, User} from "../../common/model";
import {COLORS} from "../../common/model/matrix";
import "./Tooltip.scss";
import {Icon, Trash, MessageSquare, Bold, Italic, Code} from "react-feather";
import {Editor, EditorState, RichUtils, getDefaultKeyBinding, KeyBindingUtil, ContentState, convertToRaw} from "draft-js";
import draftToHtml from 'draftjs-to-html';
import sanitizeHtml from 'sanitize-html';
const {hasCommandModifier} = KeyBindingUtil;

export type TooltipProps = {
    left: number;
    top: number;
    bottom: number;
    target: Highlight | null;
    users: User[];
    highlight: (color: string) => void;
    hide: (id: string | number) => void;
    reply: (id: string | number, plainBody: string, formattedBody: string) => void;
    changeColor: (id: string | number, color: typeof COLORS[number]) => void;
}

export const SEND_COMMAND = 'draft-editor-send';

/* No idea where to get SyntheticKeyboardEvent. */
function keyBindingFn(e: Parameters<typeof hasCommandModifier>[0]) {
    if (e.code === "Enter" && !e.shiftKey) {
        return SEND_COMMAND;
    }
    return getDefaultKeyBinding(e); 
}

type EditorButtonProps = {
    toggleStyle(style: string): void,
    icon: Icon,
    style: string,
    currentStyles: ReturnType<EditorState['getCurrentInlineStyle']>
}

const EditorButton = (props: EditorButtonProps) => {
    const MyIcon = props.icon;
    return (
        <button onClick={() => props.toggleStyle(props.style)}
            className={props.currentStyles.has(props.style) ? "current" : ""}>
            <MyIcon className="feather"/>
        </button>
    );
};

const EDITOR_ICONS = [
    ['BOLD', Bold], ['ITALIC', Italic], ['CODE', Code]
] as const;

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
        const formattedText = sanitizeHtml(draftToHtml(convertToRaw(editorState.getCurrentContent())));
        props.sendReply(plainText, formattedText);
        setEditorState(EditorState.push(editorState, ContentState.createFromText(""), 'remove-range'));
        return 'handled'
    }
    return 'not-handled';
  }
  const toggleStyle = (style: string) => {
        setEditorState(RichUtils.toggleInlineStyle(editorState, style));
  };
  const inlineStyles = editorState.getCurrentInlineStyle();
  return (
    <div className={`editor ${focused ? "focused" : ""}`}>
        <div className="editor-buttons">
            { EDITOR_ICONS.map(([string, icon]) => <EditorButton toggleStyle={toggleStyle} currentStyles={inlineStyles} style={string} icon={icon}/>) }
        </div>
        <div className={`editor-box`}>
            <Editor keyBindingFn={keyBindingFn}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                editorState={editorState}
                onChange={setEditorState}
                handleKeyCommand={handleKeyCommand}/>
        </div>
    </div>
  );
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

const DeleteButton = (props: { onClick(): void } ) => {
    return <button className="round destructive" onClick={props.onClick}><Trash/></button>
}

const ColorButton = (props: { color: string, onClick(): void, selectedColor?: string }) => {
    return <button onClick={props.onClick} className={`${props.color} color-switch round ${props.color === props.selectedColor ? "current" : ""}`}/>;
}

export const Tooltip = (props: TooltipProps) => {
    if (!props.target) {
        const highlightButtons = COLORS.map(color =>
                <ColorButton onClick={() => props.highlight(color)} color={color} key={color}/>);
        return <SmallTooltip {...props}>{highlightButtons}</SmallTooltip>;
    }
    const comments = props.target!.messages.map(msg =>
        <div className="comment" key={msg.id}>
            <div className="sender">{props.users.find(u => u.id === msg.userId)?.name || msg.userId}:</div>
            {msg.formattedBody ? <div dangerouslySetInnerHTML={{__html: sanitizeHtml(msg.formattedBody) }}></div> : <p>{msg.plainBody}</p> }
        </div>
    );
    const highlightButtons = COLORS.map(color => <ColorButton onClick={() => props.changeColor(props.target!.id, color)} key={color} color={color} selectedColor={props.target!.color}/>);
    return (
        <LargeTooltip {...props}>
            <div className="buttons">
                <span className="color-buttons">{highlightButtons}</span>
                <DeleteButton onClick={() => props.hide(props.target!.id)}/>
            </div>
            <h3>Comments</h3> 
            {comments.length === 0 ? <div className="no-comments">No comments yet</div> : <div className="comment-list">{comments}</div>}
            <span className="notice">Leave a comment</span>
            <DraftEditor sendReply={(plain, formatted) => props.reply(props.target!.id, plain, formatted) }/>
        </LargeTooltip>
    );
}
