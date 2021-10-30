import {COLORS} from "../model/matrix";
import "./Tooltip.scss";

export type TooltipProps = {
    left: number;
    top: number;
    highlight: (color: string) => void;
}

export const Tooltip = (props: TooltipProps) => {
    const {left, top} = props;
    return (
        <div className="tooltip" style={{left, top: (top - 40) }}>
            {COLORS.map(color => <button onClick={() => props.highlight(color)} key={color} className={`${color} color-switch`}/>)}
        </div>
    );
}
