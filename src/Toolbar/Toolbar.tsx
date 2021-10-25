import React from "react";
import "./Toolbar.scss";

export type ToolbarProps = {
    onOpenMenu(): void
}

export class Toolbar extends React.Component<ToolbarProps, {}> {
    render() {
        return (
            <div className="toolbar-main">
                <button onClick={this.props.onOpenMenu}>⋯</button>
            </div>
        );
    }
}
