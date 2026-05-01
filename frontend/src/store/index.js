import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice.js";

// FIXED: refactored login logic (access token kept in memory only)

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});
