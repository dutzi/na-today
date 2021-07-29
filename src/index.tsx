import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import firebase from 'firebase';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyAWCnG59mb9GTy4lom760r7od0XytfEaeE',
  authDomain: 'na-today.firebaseapp.com',
  projectId: 'na-today',
  storageBucket: 'na-today.appspot.com',
  messagingSenderId: '181437535480',
  appId: '1:181437535480:web:e6b4f16baf658af7fa570d',
  measurementId: 'G-9HE1YPKXN5',
};

firebase.initializeApp(firebaseConfig);
firebase.analytics();

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
