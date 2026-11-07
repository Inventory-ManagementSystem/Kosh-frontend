import { createSlice } from "@reduxjs/toolkit";
const getSavedTheme = (dashboard) =>
  localStorage.getItem(`kosh-${dashboard}-theme`) || "dark";
const themeSlice = createSlice({
  name: "theme",
  initialState: {
    owner: getSavedTheme("owner"),
    employee: getSavedTheme("employee"),
    supplier: getSavedTheme("supplier"),
  },
  reducers: {
    toggleTheme(state, action) {
      const dashboard = action.payload;
      if (!(dashboard in state)) return;
      state[dashboard] = state[dashboard] === "dark" ? "light" : "dark";
    },
  },
});

export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
