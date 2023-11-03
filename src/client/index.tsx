import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import App from './app';

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("app");
    hydrateRoot(container!, <App />);
});
