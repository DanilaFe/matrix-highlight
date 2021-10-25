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

export const Menu = (props: MenuProps) => {
    return (
        <Window onClose={props.onClose}>
            <Tabs currentTab={props.currentTab} onTabClick={props.onTabClick}>
                <Tab tabId="login" tabTitle="Login">
                    <LoginForm attemptLogin={() => {}}/>
                </Tab>
                <Tab tabId="signup" tabTitle="Signup"></Tab>
            </Tabs>
        </Window>
    );
}
