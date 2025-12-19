import { createTheme } from "@mui/material/styles";

// Factory function to create theme based on mode
export const createAppTheme = (mode = "dark") => {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: "#1976d2",
      },
      secondary: {
        main: "#9c27b0",
      },
      background: {
        default: isDark ? "#171717ff" : "#ffffff",
        paper: isDark ? "#03060eff" : "#fafafa",
      },
      text: {
        primary: isDark ? "#ffffff" : "#000000",
        secondary: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)",
      },
    },
    typography: {
      fontFamily: "Roboto, Arial, sans-serif",
      h1: { fontSize: "2rem", fontWeight: 600 },
    },
  });
};

// Default export for backward compatibility
export default createAppTheme("dark");
