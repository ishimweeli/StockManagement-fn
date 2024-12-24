import React from 'react';
import { createRoot } from 'react-dom/client'; // Import createRoot from react-dom/client
import './index.css'; // Import your Tailwind CSS here
import App from './App';

// Select the root DOM element
const rootElement = document.getElementById('root');

// Create a root
const root = createRoot(rootElement);

// Render your React app
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
