import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    _init: (state = null) => state,
  },
});
