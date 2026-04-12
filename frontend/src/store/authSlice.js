import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  accessToken: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action) => {
      const p = action.payload ?? {};
      state.user = p.user ?? null;
      state.accessToken = p.accessToken ?? null;
    },
    setAccessToken: (state, action) => {
      state.accessToken = action.payload ?? null;
    },
    setUser: (state, action) => {
      state.user = action.payload ?? null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
    },
  },
});

export const { setAuth, setAccessToken, setUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;
