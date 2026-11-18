import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// apply the saved (or system) theme before the first paint
try {
  const saved =
    new URLSearchParams(window.location.search).get("theme") ?? localStorage.getItem("theme");
  const dark = saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.classList.toggle("dark", dark);
} catch {
  /* ignore */
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
