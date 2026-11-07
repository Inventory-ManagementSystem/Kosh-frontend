import { useDispatch, useSelector } from "react-redux";
import { toggleTheme as toggleThemeAction } from "../store/themeSlice";

export function ThemeProvider({ children }) {
  return children;
}
export function useTheme() {
  const dispatch = useDispatch();
  const themes = useSelector((state) => state.theme);
  const toggleTheme = (dashboard) => dispatch(toggleThemeAction(dashboard));
  return { themes, toggleTheme };
}
