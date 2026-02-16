/**
 * CelebLink - Clickable celebrity name that opens Wikipedia page
 * Features cool hover effects and smooth transitions
 */

import { Box } from "@mui/material";
import { OpenInNew } from "@mui/icons-material";

function CelebLink({ celebName }) {
  const handleClick = (e) => {
    e.stopPropagation();
    // Convert display name to Wikipedia URL format (replace spaces with underscores)
    const wikiUrl = `https://en.wikipedia.org/wiki/${celebName.replace(/\s+/g, "_")}`;
    window.open(wikiUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Box
      component="span"
      onClick={handleClick}
      sx={{
        position: "relative",
        cursor: "pointer",
        fontWeight: "bold",
        color: "#00d4ff",
        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        textDecoration: "none",
        display: "inline-block",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        
        // Cool glow effect on hover
        "&:hover": {
          color: "#00ffff",
          textShadow: `
            0 0 10px #00d4ff,
            0 0 20px #00ffff,
            0 0 30px #0099ff,
            0 0 40px #0066ff
          `,
          transform: "scale(1.05)",
        },

        // Neon underline
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: -2,
          left: 0,
          right: 0,
          height: 2,
          background: "linear-gradient(90deg, #00d4ff, #00ffff, #00d4ff)",
          boxShadow: "0 0 10px #00d4ff",
          transform: "scaleX(0)",
          transformOrigin: "center",
          transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        },

        "&:hover::after": {
          transform: "scaleX(1)",
        },
      }}
    >
      {celebName}
    </Box>
  );
}

export default CelebLink;
