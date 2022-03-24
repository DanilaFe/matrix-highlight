import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import '../common/common.scss';

const newElement = document.createElement('div');
newElement.attachShadow({ mode: "open" });
const { shadowRoot } = newElement;

const reactRoot = document.createElement('div');
reactRoot.classList.add("matrix-highlight");

shadowRoot?.appendChild(reactRoot);
document.body.appendChild(newElement);

ReactDOM.render(
  <React.StrictMode>
      <App />
  </React.StrictMode>,
  reactRoot
);

for (const styleTag of (window as any)._matrixHighlightStyleNodes) {
    shadowRoot?.appendChild(styleTag);
};
