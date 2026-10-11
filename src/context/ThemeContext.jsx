import { createContext, useContext, useState } from "react";

const ThemeContext = createContext();

const getSavedTheme = (dashboard) => {
  return localStorage.getItem(`kosh-${dashboard}-theme`) || "dark";
};

export function ThemeProvider({ children }) {
  const [themes, setThemes] = useState({
    owner: getSavedTheme("owner"),
    employee: getSavedTheme("employee"),
    supplier: getSavedTheme("supplier"),
  });

  const toggleTheme = (dashboard) => {
    setThemes((currentThemes) => {
      const newTheme = currentThemes[dashboard] === "dark" ? "light" : "dark";
      localStorage.setItem(`kosh-${dashboard}-theme`, newTheme);
      return {
        ...currentThemes,
        [dashboard]: newTheme,
      };
    });
  };

  return (
    <ThemeContext.Provider value={{ themes, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
