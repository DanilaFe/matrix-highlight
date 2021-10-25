import {COLORS} from "../constants";
import "./Tooltip.scss";

export const Tooltip = () => {
    return (
        <div className="tooltip">
            {COLORS.map(color => <button key={color} className={`${color} color-switch`}/>)}
        </div>
    );
}
