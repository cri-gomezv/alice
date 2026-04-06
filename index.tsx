import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement); // USA EL ESTÁNDAR
  root.render(
    <React.StrictMode>
      <BrowserRouter basename="/alice">
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
}