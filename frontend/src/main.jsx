import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="850377166554-t2t4upl87p65cdn7ifgu5cq7h3rvajjp.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
);