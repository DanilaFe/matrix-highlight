import {useState, PropsWithChildren} from "react";
import {COLORS} from "../../common/model/matrix";
import 'draft-js/dist/Draft.css';
import "./Tooltip.scss";
import {Trash, MessageSquare} from "react-feather";
import {Editor, EditorState, RichUtils} from "draft-js";

export enum TooltipMode {
    Click = "click",
    Reply = "reply",
};

export type TooltipProps = {
    left: number;
    top: number;
    bottom: number;
    target: string | number | null;
    mode: TooltipMode;
    highlight: (color: string) => void;
    hide: (id: string | number) => void;
    reply: (id: string | number) => void;
}

function DraftEditor() {
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const [focused, setFocused] = useState(false);
  const handleKeyCommand = (command: string, editorState: EditorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
        setEditorState(newState);
        return 'handled';
    }
    return 'not-handled';
  }
  return <div className={`editor ${focused ? "focused" : ""}`}><Editor onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} editorState={editorState} onChange={setEditorState} handleKeyCommand={handleKeyCommand}/></div>;
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
                    onClick={() => props.hide(props.target!)}><Trash/></button>
                <button
                    onClick={() => props.reply(props.target!)}><MessageSquare/></button>
            </SmallTooltip>
        );
    }
    return (
        <LargeTooltip {...props}>
            <h3>Comments</h3>
            <span className="notice">Leave a comment</span>
            <DraftEditor/>
        </LargeTooltip>
    );
}
