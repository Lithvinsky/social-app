import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistGate } from "redux-persist/integration/react";
import App from "./App.jsx";
import "./index.css";
import {
  store,
  persistor,
  hydrateAuthFromLegacyStorage,
} from "./store/index.js";

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
        <PersistGate
          persistor={persistor}
          loading={
            <div className="min-h-screen bg-surface flex items-center justify-center text-slate-500 text-sm">
              Loading…
            </div>
          }
          onBeforeLift={() => {
            try {
              hydrateAuthFromLegacyStorage();
            } catch (e) {
              console.error("hydrateAuthFromLegacyStorage", e);
            }
            return Promise.resolve();
          }}
        >
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </PersistGate>
      </Provider>
    </React.StrictMode>
  );
}
