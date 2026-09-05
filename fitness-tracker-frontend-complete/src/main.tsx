// Safeguard against polyfills attempting to assign to window.fetch when getter-only
try {
  if (typeof window !== 'undefined' && window.fetch) {
    let currentFetch = window.fetch.bind(window);
    try {
      Object.defineProperty(window, 'fetch', {
        get: () => currentFetch,
        set: (fn) => { currentFetch = fn; },
        configurable: true,
        enumerable: true
      });
    } catch {
      // already defined or non-configurable
    }
  }
} catch {
  // ignore
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
