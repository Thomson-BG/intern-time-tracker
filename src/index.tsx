import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // ensure Tailwind directives & custom CSS are loaded

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
