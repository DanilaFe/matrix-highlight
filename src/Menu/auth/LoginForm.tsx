import React from "react";
import "./LoginForm.scss";

export type LoginFormProps = {
    attemptLogin(username: string, password: string, homeserver: string): void;
}

type LoginFormState = {
    tryingLogin: boolean;
    username: string;
    password: string;
    homeserver: string;
}

export class LoginForm extends React.Component<LoginFormProps, LoginFormState> {
    constructor(props: LoginFormProps) {
        super(props);
        this.state = { tryingLogin: false, username: "", password: "", homeserver: "matrix.org" };
        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.handleHomeserverChange = this.handleHomeserverChange.bind(this);
    }

    handleUsernameChange(event: React.ChangeEvent<HTMLInputElement>) { this.setState(state => ({ ...state, username: event.target.value })); }
    handlePasswordChange(event: React.ChangeEvent<HTMLInputElement>) { this.setState(state => ({ ...state, password: event.target.value })); }
    handleHomeserverChange(event: React.ChangeEvent<HTMLInputElement>) { this.setState(state => ({ ...state, homeserver: event.target.value })); }

    render() {
        const disabled = this.state.tryingLogin;
        return (
            <form id="LoginForm" onSubmit={() => {}}>
                <label htmlFor="username">Matrix Username</label>
                <input value={this.state.username} onChange={this.handleUsernameChange} placeholder="your-matrix-username" id="username" type="text" disabled={disabled}></input>
                <label htmlFor="password">Password</label>
                <input value={this.state.password} onChange={this.handlePasswordChange} type="password" id="password" disabled={disabled}></input>
                <label htmlFor="homeserver">Homeserver</label>
                <input value={this.state.homeserver} onChange={this.handleHomeserverChange} type="text" id="homeserver" disabled={disabled}></input>
                <input type="submit" value="Log In" className="primary" disabled={disabled}></input>
            </form>
        )
    }
}
