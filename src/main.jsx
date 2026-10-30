import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/inter-tight/400.css';
import '@fontsource/inter-tight/600.css';
import '@fontsource/inter-tight/800.css';
import '@fontsource/rubik-bubbles';
import './ui/styles/app.css';
import App from './ui/App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
