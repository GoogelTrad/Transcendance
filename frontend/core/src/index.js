import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './game/Tournament/Tournament.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './i18n/i18nConfig';

// if (typeof browser === "undefined") {
//   var browser = chrome;
// }
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App />
  // <React.StrictMode>
  //   <App />
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
