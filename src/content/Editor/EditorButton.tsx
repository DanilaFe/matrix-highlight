import {EditorState} from "draft-js";
import {Icon, Bold, Italic, Code} from "react-feather";
import styles from "./Editor.scss";

export const EDITOR_BUTTONS = [
    ['BOLD', Bold], ['ITALIC', Italic], ['CODE', Code]
] as const;

export type EditorButtonProps = {
    toggleStyle(style: string): void,
    icon: Icon,
    style: string,
    currentStyles: ReturnType<EditorState['getCurrentInlineStyle']>
}

export const EditorButton = (props: EditorButtonProps) => {
    const MyIcon = props.icon;
    return (
        <button onClick={() => props.toggleStyle(props.style)}
            className={props.currentStyles.has(props.style) ? styles.current : ""}>
            <MyIcon/>
        </button>
    );
};
