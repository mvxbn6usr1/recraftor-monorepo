import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

declare global {
  interface Window {
    userId: string;
    parentOrigin: string;
    requestTokenOperation: (operation: string, metadata?: any) => Promise<boolean>;
  }
}

// Get environment variables
const PORTAL_URL = import.meta.env.VITE_PORTAL_URL;
const ENV = import.meta.env.VITE_ENV || 'development';

if (!PORTAL_URL) {
  throw new Error('VITE_PORTAL_URL environment variable is not set');
}

// Check if running in iframe and validate parent origin
const isInIframe = window.self !== window.top;
const parentOrigin = document.referrer.replace(/\/$/, '');

// Validate origin against environment settings
const isValidOrigin = (origin: string): boolean => {
  if (ENV === 'development') {
    return origin === PORTAL_URL;
  }
  // Add production origins when needed
  const productionOrigins = [
    'https://your-production-domain.com',
    'https://your-staging-domain.com'
  ];
  return productionOrigins.includes(origin);
};

// Block direct access
if (!isInIframe || !isValidOrigin(parentOrigin)) {
  document.body.innerHTML = '<div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: system-ui; background: #f3f4f6;"><div style="text-align: center; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"><h1 style="margin: 0 0 10px; color: #1f2937;">Access Denied</h1><p style="margin: 0; color: #6b7280;">This application can only be accessed through the authorized portal.</p></div></div>';
  throw new Error('Direct access not allowed');
}

// Store parent origin
window.parentOrigin = parentOrigin;

// Token operation handler
window.requestTokenOperation = (operation: string, metadata?: any): Promise<boolean> => {
  return new Promise((resolve) => {
    const handleResponse = (event: MessageEvent) => {
      if (event.origin !== window.parentOrigin) return;
      
      if (event.data.type === 'OPERATION_RESPONSE' && event.data.operation === operation) {
        window.removeEventListener('message', handleResponse);
        resolve(event.data.success);
      }
    };

    window.addEventListener('message', handleResponse);
    
    window.parent.postMessage(
      { type: 'OPERATION_REQUEST', operation, metadata },
      window.parentOrigin
    );
  });
};

// Handle messages from parent window
window.addEventListener('message', (event) => {
  if (!isValidOrigin(event.origin)) {
    console.warn('Received message from unauthorized origin:', event.origin);
    return;
  }

  try {
    switch (event.data.type) {
      case 'INITIALIZE':
        window.userId = event.data.userId;
        window.parentOrigin = event.origin;
        window.parent.postMessage({ type: 'RECRAFTOR_READY' }, event.origin);
        break;
      case 'OPERATION_RESPONSE':
        // Handled by requestTokenOperation
        break;
      default:
        console.log('Unhandled message type:', event.data.type);
    }
  } catch (err) {
    console.error('Error processing message:', err);
    window.parent.postMessage(
      { type: 'RECRAFTOR_ERROR', error: 'Failed to process message' },
      event.origin
    );
  }
});

// Notify parent window when loaded
window.addEventListener('load', () => {
  if (window.parentOrigin && isValidOrigin(window.parentOrigin)) {
    window.parent.postMessage({ type: 'RECRAFTOR_LOADED' }, window.parentOrigin);
  }
});

// Only render if we're in a valid iframe
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
