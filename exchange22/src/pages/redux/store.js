// store.js
import { configureStore } from "@reduxjs/toolkit";
import masterReducer from "../fetures/masterdata/masterSlice";
export const store = configureStore({
  reducer: {
    master: masterReducer,
  },
});
