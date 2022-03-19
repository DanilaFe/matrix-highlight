import React from 'react';
import ReactDOM from 'react-dom';
import styles from '../common/common.scss';
import App from './App';

const newElement = document.createElement('div');
document.body.appendChild(newElement);
newElement.classList.add(styles.matrixHighlight);
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  newElement
);
