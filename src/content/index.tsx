import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import '../common/common.scss';
import global from "!!css-loader!sass-loader!./global.module.scss";
import createCache from '@emotion/cache';
import {CacheProvider} from "@emotion/react";

const newElement = document.createElement('div');
newElement.attachShadow({ mode: "open" });
document.body.appendChild(newElement);
const { shadowRoot } = newElement;

const shadowCache = createCache({
    key: 'emotion',
    container: shadowRoot as any
});

const globalStyle = document.createElement('style');
globalStyle.innerHTML = global.toString();
document.head.appendChild(globalStyle);
for (const styleTag of (window as any)._matrixHighlightStyleNodes) {
    shadowRoot?.appendChild(styleTag);
};

const reactRoot = document.createElement('div');
reactRoot.classList.add("matrix-highlight");
shadowRoot?.appendChild(reactRoot);
ReactDOM.render(
  <React.StrictMode>
      <CacheProvider value={shadowCache}>
        <App/>
      </CacheProvider>
  </React.StrictMode>,
  reactRoot
);
