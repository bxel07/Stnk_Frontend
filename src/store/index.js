import { configureStore } from "@reduxjs/toolkit";
import stnkReducer from "@/slices/stnkSlice";
import loginReducer from "@/slices/loginSlice";
import authReducer from "@/slices/authSlice";

export const store = configureStore({
  reducer: {
    stnk: stnkReducer,
    login: loginReducer,
    auth: authReducer,
  },
});
