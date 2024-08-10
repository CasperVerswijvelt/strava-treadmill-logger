import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { StravaAuthProvider } from "./providers/StravaAuth.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  //<React.StrictMode>
  <StravaAuthProvider>
    <App />
  </StravaAuthProvider>
  //</React.StrictMode>
);
