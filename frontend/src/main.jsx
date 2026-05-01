import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.jsx";
import "./index.css";
import { store } from "./store/index.js";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 58_000,
      retry: 1,
    },
  },
});

const rootEl = document.getElementById("root");
if (!rootEl) {
  console.error("Missing #root element");
} else {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <Provider store={store}>
        {/* FIXED: refactored login logic (in-memory auth state) */}
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </Provider>
    </React.StrictMode>
  );
}
