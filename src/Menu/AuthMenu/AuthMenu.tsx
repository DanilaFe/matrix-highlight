import {Tab, Tabs} from "../../utils/Tabs";
import {LoginForm} from "./LoginForm";
export type AuthMenuTab = "login" | "signup";

export type AuthMenuProps = {
    modeId: string
    authEnabled: boolean;
    tab: AuthMenuTab;
    onTabClick(tab: AuthMenuTab): void;
    attemptLogin(username: string, password: string, homeserver: string): void;
    attemptSignup(username: string, password: string, homeserver: string): void;
}

export const AuthMenu = (props: AuthMenuProps) => {
    return (
        <Tabs currentTab={props.tab} onTabClick={props.onTabClick}>
            <Tab tabId="login" tabTitle="Login">
                <LoginForm authEnabled={props.authEnabled} attemptLogin={props.attemptLogin}/>
            </Tab>
            <Tab tabId="signup" tabTitle="Signup"></Tab>
        </Tabs>
    );
}
