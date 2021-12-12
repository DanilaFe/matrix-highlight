import React from 'react';
import ReactDOM from 'react-dom';
import '../common/common.scss';
import './popup.scss';
import {App} from "./App";

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById("root")!
);
