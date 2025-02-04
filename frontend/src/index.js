import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import store from './store';
import './styles/index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Root element not found. Please ensure there is a <div id='root'></div> in your HTML.");
}

const root = ReactDOM.createRoot(rootElement);

const handleGlobalErrors = () => {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
  });

  window.addEventListener('error', (event) => {
    console.error('Global error caught:', event.message);
  });
};

handleGlobalErrors();

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
