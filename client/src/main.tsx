import { createRoot } from "react-dom/client";
import React from "react";
import App from "./App";
import "./index.css";
import { Router } from "wouter";

// Simple direct rendering
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);
