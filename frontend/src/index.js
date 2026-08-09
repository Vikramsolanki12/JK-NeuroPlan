import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext"; // ✅ ADD THIS

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <ThemeProvider>
    <AuthProvider>   {/* ✅ WRAP APP */}
      <App />
    </AuthProvider>
  </ThemeProvider>
);

reportWebVitals();
