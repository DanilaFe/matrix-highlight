import {PropsWithChildren} from "react";
import {Highlight} from "../../common/model";
import {COLORS} from "../../common/model/matrix";
import "./Tooltip.scss";
import {Trash} from "react-feather";
import {Editor} from "../Editor/Editor";
import {CommentList} from "../CommentList/CommentList";

export type TooltipProps = {
    left: number;
    top: number;
    bottom: number;
    target: Highlight | null;
    highlight: (color: string) => void;
    hide: (id: string | number) => void;
    reply: (id: string | number, plainBody: string, formattedBody: string) => void;
    changeColor: (id: string | number, color: typeof COLORS[number]) => void;
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
    const currentClass = props.color === props.selectedColor ? "current" : "";
    return (
        <button onClick={props.onClick}
            className={`color-switch round ${currentClass} ${props.color}`}/>
    );
}

export const Tooltip = (props: TooltipProps) => {
    if (!props.target) {
        const highlightButtons = COLORS.map(color =>
                <ColorButton onClick={() => props.highlight(color)} key={color} color={color}/>);
        return <SmallTooltip {...props}>{highlightButtons}</SmallTooltip>;
    }
    const highlightButtons = COLORS.map(color =>
        <ColorButton onClick={() => props.changeColor(props.target!.id, color)}
            key={color} color={color} selectedColor={props.target!.color}/>
    );
    return (
        <LargeTooltip {...props}>
            <div className="buttons">
                <span className="color-buttons">{highlightButtons}</span>
                <DeleteButton onClick={() => props.hide(props.target!.id)}/>
            </div>
            <h3>Comments</h3> 
            <CommentList messages={props.target.messages}/>
            <span className="notice">Leave a comment</span>
            <Editor sendReply={(plain, formatted) => props.reply(props.target!.id, plain, formatted) }/>
        </LargeTooltip>
    );
}
