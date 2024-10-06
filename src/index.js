// src/index.js
import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";

// Import the buffer package
import { Buffer } from "buffer";

// Assign Buffer to the global window object
window.Buffer = Buffer;

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
