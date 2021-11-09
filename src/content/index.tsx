import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';

const newElement = document.createElement('div');
document.body.appendChild(newElement);
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  newElement
);
