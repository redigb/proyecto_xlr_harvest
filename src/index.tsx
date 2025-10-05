// ==============================================
// ENTRY POINT - XLR HARVEST GAME
// ==============================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Importar estilos globales (SOLO globals.css, que ya importa los demás)
import './styles/globals.css';

// Configuración de desarrollo
if (import.meta.env.DEV) {
  console.log('🎮 XLR Harvest - Development Mode');
}

// Obtener el elemento root
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

// Crear y renderizar la aplicación
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