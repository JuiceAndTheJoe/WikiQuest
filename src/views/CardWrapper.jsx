import { memo } from "react";
import { Box } from "@mui/material";
import ElectricBorder from "../components/ElectricBorder";

const CardWrapper = memo(function CardWrapper({
  borderConfig,
  flex = 2,
  children,
}) {
  const content = (
    <Box sx={{ bgcolor: "rgba(255, 255, 255, 0.1)", p: 3 }}>{children}</Box>
  );

  if (borderConfig.opacity > 0) {
    return (
      <ElectricBorder
        color={borderConfig.color}
        speed={borderConfig.speed}
        chaos={borderConfig.chaos}
        thickness={borderConfig.thickness}
        effectOpacity={borderConfig.opacity}
        style={{ flex, borderRadius: 8 }}
      >
        {content}
      </ElectricBorder>
    );
  }

  return (
    <Box
      sx={{
        flex,
        bgcolor: "rgba(255, 255, 255, 0.1)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: 2,
        p: 3,
      }}
    >
      {content}
    </Box>
  );
});

export default CardWrapper;
