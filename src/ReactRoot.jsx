import { Provider, connect } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { createAppTheme } from "./styles/theme";
import { store } from "./app/store";
import App from "./presenters/AppContainer";

function ThemedApp({ themeMode }) {
  const theme = createAppTheme(themeMode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  );
}

const mapStateToProps = (state) => ({
  themeMode: state.theme.mode,
});

const ConnectedThemedApp = connect(mapStateToProps)(ThemedApp);

export function ReactRoot() {
  return (
    <Provider store={store}>
      <ConnectedThemedApp />
    </Provider>
  );
}
