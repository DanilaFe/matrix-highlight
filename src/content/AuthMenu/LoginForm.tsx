import React, { useState } from "react";
import styles from "./LoginForm.scss";

export type LoginFormProps = {
    authEnabled: boolean;
    loginError: string | null;
    attemptLogin(username: string, password: string, homeserver: string): void;
}

export const LoginForm = (props: LoginFormProps) => {
    const [trying] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [homeserver, setHomeserver] = useState("matrix.org");

    return (
        <form id={styles.LoginForm} onSubmit={e => { e.preventDefault(); props.attemptLogin(username, password, homeserver) }}>
            { props.loginError ? <p className={styles.loginError}>{props.loginError}</p> : <></> }
            <fieldset disabled={!props.authEnabled}>
                <label htmlFor="mhl-username">Matrix Username</label>
                <input placeholder="your-matrix-username" id="mhl-username" type="text"
                    value={username} onChange={e => setUsername(e.target.value)} disabled={trying}/>
                <label htmlFor="mhl-password">Password</label>
                <input type="password" id="mhl-password"
                    value={password} onChange={e => setPassword(e.target.value)} disabled={trying}/>
                <label htmlFor="mhl-homeserver">Homeserver</label>
                <input value={homeserver} onChange={e => setHomeserver(e.target.value)} disabled={trying} type="text" id="mhl-homeserver"></input>
                <input type="submit" value="Log In" className="primary" disabled={trying}></input>
            </fieldset>
        </form>
    );
}
