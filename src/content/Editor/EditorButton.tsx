import {Icon, Bold, Italic, Code} from "react-feather";

export const EDITOR_BUTTONS = [
    ['bold', Bold], ['italic', Italic], ['code', Code]
] as const;

export type EditorButtonProps = {
    toggleStyle(style: string): void,
    icon: Icon,
    style: string,
    current: boolean
}

export const EditorButton = (props: EditorButtonProps) => {
    const MyIcon = props.icon;
    return (
        <button onClick={() => props.toggleStyle(props.style)}
            className={props.current ? "current" : ""}>
            <MyIcon className="feather"/>
        </button>
    );
};
