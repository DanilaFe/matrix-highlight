import React from "react"
import {Tab,Tabs} from "../utils/Tabs";
import "./Menu.scss";
import {LoginForm} from "./auth/LoginForm";
import {Window} from "./Window";

export type MenuProps = {
    currentTab: "login" | "signup";
    onTabClick(tab: "login" | "signup"): void;
    onClose(): void;
}

export class Menu extends React.Component<MenuProps, {}> {
    render() {
        return (
            <Window onClose={this.props.onClose}>
                <Tabs currentTab={this.props.currentTab} onTabClick={this.props.onTabClick}>
                    <Tab tabId="login" tabTitle="Login">
                        <LoginForm attemptLogin={() => {}}/>
                    </Tab>
                    <Tab tabId="signup" tabTitle="Signup"></Tab>
                </Tabs>
            </Window>
        );
    }
}
