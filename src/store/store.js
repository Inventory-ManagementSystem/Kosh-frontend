import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./themeSlice";

export const store = configureStore({
  reducer: {
    theme: themeReducer,
  },
});
let previous = store.getState().theme;
const applyTheme = (themes) => {
  document.documentElement.setAttribute("data-theme", themes.owner);
};
applyTheme(previous);
store.subscribe(() => {
  const current = store.getState().theme;
  if (current === previous) return;
  Object.entries(current).forEach(([dashboard, value]) => {
    if (value !== previous[dashboard]) {
      localStorage.setItem(`kosh-${dashboard}-theme`, value);
    }
  });
  applyTheme(current);
  previous = current;
});
