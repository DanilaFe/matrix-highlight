import React from "react"
import {Tab,Tabs} from "../utils/Tabs";
import "./Menu.scss";
import {LoginForm} from "./auth/LoginForm";
import {QuoteList} from "./tools/QuoteList";
import {RoomList} from "./tools/RoomList";
import {Window} from "./Window";
import {Page} from "../model";

export type MenuProps = {
    page: Page;
    currentRoomId: string | null;
    mode: "auth" | "tools";
    authTab: "login" | "signup";
    onAuthTabClick(tab: "login" | "signup"): void;
    toolsTab: "quotes" | "rooms" | "users";
    onToolsTabClick(tab: "quotes" | "rooms" | "users"): void;
    onClose(): void;
}

export const Menu = (props: MenuProps) => {
    const authView = (
        <Tabs currentTab={props.authTab} onTabClick={props.onAuthTabClick}>
            <Tab tabId="login" tabTitle="Login">
                <LoginForm attemptLogin={() => {}}/>
            </Tab>
            <Tab tabId="signup" tabTitle="Signup"></Tab>
        </Tabs>
    );
    const toolsView = (
        <Tabs currentTab={props.toolsTab} onTabClick={props.onToolsTabClick}>
            <Tab tabId="quotes" tabTitle="Quotes">
                <QuoteList highlights={props.page.getRoom(props.currentRoomId)!.highlights}/>
            </Tab>
            <Tab tabId="rooms" tabTitle="Rooms">
                <RoomList rooms={props.page.rooms} currentRoomId={props.currentRoomId} onRoomClick={() => {}}/>
            </Tab>
            <Tab tabId="users" tabTitle="Users"></Tab>
        </Tabs>
    );
    return (
        <Window onClose={props.onClose}>
            {props.mode === "auth" ? authView : toolsView}
        </Window>
    );
}
