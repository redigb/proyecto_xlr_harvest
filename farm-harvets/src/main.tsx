import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';


if (import.meta.env.DEV) {
  console.log('🎮 XLR Harvest - Development Mode');
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Hot Module Replacement (HMR) para desarrollo
if (import.meta.hot) {
  import.meta.hot.accept();
}