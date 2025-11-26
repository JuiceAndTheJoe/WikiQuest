import { createTheme } from '@mui/material/styles';

// Example custom theme; adjust palette/typography as needed
const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#9c27b0',
        },
        background: {
            default: '#f5f7fa',
            paper: '#ffffff',
        },
    },
    typography: {
        fontFamily: 'Roboto, Arial, sans-serif',
        h1: { fontSize: '2rem', fontWeight: 600 },
    },
});

export default theme;
