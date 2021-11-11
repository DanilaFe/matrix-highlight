import {PORT_POP} from "../common/messages";
export {}

const port = chrome.runtime.connect({ name: PORT_POP });
port.onMessage.addListener(msg => {
    if (msg.type === "login-required") {
        port.postMessage({
            type: "attempt-login",
            username: "vanilla-ice-cream",
            password: "three twenty six",
            homeserver: "matrix.org"
        });
        document.getElementById("target")!.innerHTML = "Logging in...";
    } else if (msg.type === "login-successful") {
        document.getElementById("target")!.innerHTML = `Logged in as ${msg.name}!`;
    }
});
