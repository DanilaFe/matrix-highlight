export {}

const port = chrome.runtime.connect();
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
