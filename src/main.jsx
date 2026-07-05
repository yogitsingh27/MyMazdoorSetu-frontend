import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppProviders from '@/contexts/AppProviders';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import App from '@/App';

// Design system — ported verbatim from the prototype, load order matters
// (tokens define the CSS variables that global.css consumes).
import '@/styles/tokens.css';
import '@/styles/global.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProviders>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </AppProviders>
    </BrowserRouter>
  </React.StrictMode>,
);
