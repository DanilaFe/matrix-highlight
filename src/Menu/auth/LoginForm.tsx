import React, { useState } from "react";
import "./LoginForm.scss";

export type LoginFormProps = {
    attemptLogin(username: string, password: string, homeserver: string): void;
}

export const LoginForm = (props: LoginFormProps) => {
    const [trying] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [homeserver, setHomeserver] = useState("matrix.org");

    return (
        <form id="LoginForm" onSubmit={() => {}}>
            <label htmlFor="username">Matrix Username</label>
            <input placeholder="your-matrix-username" id="username" type="text"
                value={username} onChange={e => setUsername(e.target.value)} disabled={trying}/>
            <label htmlFor="password">Password</label>
            <input type="password" id="password"
                value={password} onChange={e => setPassword(e.target.value)} disabled={trying}/>
            <label htmlFor="homeserver">Homeserver</label>
            <input value={homeserver} onChange={e => setHomeserver(e.target.value)} disabled={trying} type="text" id="homeserver"></input>
            <input type="submit" value="Log In" className="primary" disabled={trying}></input>
        </form>
    );
}
