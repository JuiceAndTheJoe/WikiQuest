import { createTheme } from "@mui/material/styles";

// Example custom theme; adjust palette/typography as needed
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#9c27b0",
    },
    background: {
      default: "#171717ff",
      paper: "#393939ff",
    },
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
    h1: { fontSize: "2rem", fontWeight: 600 },
  },
});

export default theme;
