import * as browser from "webextension-polyfill";

const metaTag = document.querySelector("meta[name=matrix-highlight-comments]");
if (metaTag) {
    browser.runtime.sendMessage({ type: "has-page-meta" });
}
