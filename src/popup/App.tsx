import {useState, useEffect} from "react";
import {PORT_POP} from "../common/messages";
import {AuthMenu} from "./AuthMenu/AuthMenu";

export const App = () => {
    const [port, setPort] = useState<chrome.runtime.Port | null>(null);
    const [mode, setMode] = useState<"login" | "logged-in">("login");
    const [authTab, setAuthTab] = useState<"login" | "signup">("login");
    const [authEnabled, setAuthEnabled] = useState<boolean>(true);

    useEffect(() => {
        const port = chrome.runtime.connect({ name: PORT_POP });
        setPort(port);
        port.onMessage.addListener(msg => {
            if (msg.type === "login-required") {
                setMode("login");
            } else if (msg.type === "login-successful") {
                setMode("logged-in");
            }
        });
    }, [setPort]);

    const attemptLogin = (username: string, password: string, homeserver: string) => {
        port?.postMessage({
            type: "attempt-login", username, password, homeserver
        });
    };

    return mode === "login" ?
        <AuthMenu
            tab={authTab}
            authEnabled={authEnabled}
            onTabClick={setAuthTab}
            attemptLogin={attemptLogin}
            attemptSignup={() => {}}
        /> : <>"Logged in!"</>;
};
