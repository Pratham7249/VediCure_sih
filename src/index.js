import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // This file handles global styles
import VedaCare from './VedaCare'; // Import your new component

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <VedaCare />
  </React.StrictMode>
);