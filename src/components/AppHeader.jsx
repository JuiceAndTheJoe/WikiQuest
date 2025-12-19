import { connect } from "react-redux";
import { IconButton, Box } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { toggleTheme } from "../app/features/theme/themeSlice";

function AppHeader({ themeMode, onToggleTheme }) {
  const isDark = themeMode === "dark";

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 16,
        left: 16,
        zIndex: 1000,
      }}
    >
      <IconButton
        onClick={onToggleTheme}
        aria-label="toggle theme"
        sx={{
          color: "text.primary",
        }}
      >
        {isDark ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </Box>
  );
}

const mapStateToProps = (state) => ({
  themeMode: state.theme.mode,
});

const mapDispatchToProps = (dispatch) => ({
  onToggleTheme: () => dispatch(toggleTheme()),
});

export default connect(mapStateToProps, mapDispatchToProps)(AppHeader);
