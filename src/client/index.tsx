import React from 'react';
import { createRoot } from 'react-dom/client';

window.addEventListener("DOMContentLoaded", () => {
    // Clear the existing HTML content
    document.body.innerHTML = '<div id="app"></div>';

    // Render your React component instead
    const root = createRoot(document.getElementById('app')!);
    root.render(<h1>Hello, world</h1>);

    console.log("----hello world-----");
});