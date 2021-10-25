import React from "react"
import {Tab,Tabs} from "../utils/Tabs";
import { X } from "react-feather";
import "./Menu.scss";
import {COLORS} from "../constants";

export type MenuProps = {
    currentTab: "login" | "signup";
    onTabClick(tab: "login" | "signup"): void;
    onClose(): void;
}

export class Menu extends React.Component<MenuProps, {}> {
    render() {
        return (
            <div className="menu">
                <div className="title">
                    {COLORS.map(color => <span key={color} className={`${color} color-dot`}></span>)}
                    <span className="title-text">Matrix Highlight</span>
                    <X className="close-button" onClick={this.props.onClose}/>
                </div>
                <Tabs currentTab={this.props.currentTab} onTabClick={this.props.onTabClick}>
                    <Tab tabId="login" tabTitle="Login"></Tab>
                    <Tab tabId="signup" tabTitle="Signup"></Tab>
                </Tabs>
            </div>
        );
    }
}
