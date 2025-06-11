import { configureStore } from "@reduxjs/toolkit";
import stnkReducer from "@/slices/stnkSlice";

export const store = configureStore({
  reducer: {
    stnk: stnkReducer,
  },
});
