// authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: token || null,
    user: user || null,
  },
  reducers: {
    setCredentials: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
    
      // Simpan ke localStorage
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
    
      // Hapus dari localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },    
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
