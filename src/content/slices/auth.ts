import {ToContentMessage} from "../../common/messages";

export type AuthState = {
    userId: string | null;
    showLogin: boolean;
    loginInProgress: boolean;
    loginError: string | null;
}

export type AuthEvent = ToContentMessage
    | { type: "begin-login-attempt" }
    | { type: "clear-login-error" }
    | { type: "set-show-login", showLogin: boolean }

export const authReducer = (state: AuthState, event: AuthEvent) => {
    const newState = Object.assign({}, state);
    if (event.type === "set-show-login") {
        newState.showLogin = event.showLogin;
    } else if (event.type === "begin-login-attempt") {
        newState.loginInProgress = true;
    } else if (event.type === "clear-login-error") {
        newState.loginError = null;
    } else if (event.type === "logged-in") {
        newState.userId = event.userId;
        newState.loginInProgress = false;
        newState.showLogin = false;
    } else if (event.type === "login-failed") {
        newState.loginError = event.loginError;
        newState.loginInProgress = false;
    }

    return newState
}

export const authInitialState = {
    userId: null,
    showLogin: false,
    loginInProgress: false,
    loginError: null,
};
