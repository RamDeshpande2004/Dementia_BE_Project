import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css"; // Global styles

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

window.addEventListener("error", (e) => {
  console.log(
    "🔥 React render error:",
    e.message,
    e.filename,
    "line:",
    e.lineno
  );
});
