import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ChatProvider } from "./hooks/useChat";
import { STTProvider } from "./hooks/useSTT";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <STTProvider>
      <ChatProvider>
        <App />
      </ChatProvider>
    </STTProvider>
  </React.StrictMode>
);
