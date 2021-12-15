import {COLORS} from "../../common/model/matrix";
import "./Tooltip.scss";
import {Trash} from "react-feather";

export type TooltipProps = {
    left: number;
    top: number;
    bottom: number;
    target: string | number | null;
    highlight: (color: string) => void;
    hide: (id: string | number) => void;
}

export const Tooltip = (props: TooltipProps) => {
    const {left, top} = props;
    const highlightButtons = COLORS.map(color =>
        <button onClick={() => props.highlight(color)} key={color} className={`${color} color-switch`}/>);
    const toolbarButtons = [
        <button className="destructive"
            onClick={() => props.hide(props.target!)}
            onMouseUp={e => e.stopPropagation()}><Trash/></button>
    ];
    return (
        <div className="tooltip" style={{left, top: (top - 40) }}>
            {props.target ? toolbarButtons : highlightButtons}
        </div>
    );
}
