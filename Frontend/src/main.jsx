// בקובץ זה נמצא נקודת הכניסה הראשית של האפליקציה
// הקובץ מגדיר את רכיב השורש ומריץ את האפליקציה הראשית
// הוא משמש כנקודת התחלה לכל הרכיבים והפונקציונליות של המערכת
// import React from 'react'
import React from 'react';
import ReactDOM from 'react-dom/client';
import 'normalize.css';
import './index.css';
import App from './app/App.jsx';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>
);
