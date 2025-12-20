import { memo } from "react";
import { Box } from "@mui/material";
import ElectricBorder from "../../components/ElectricBorder";

const CardWrapper = memo(function CardWrapper({
  borderConfig,
  flex = 2,
  children,
}) {
  const content = (
    <Box
      sx={{
        bgcolor: "rgba(255, 255, 255, 0.1)",
        p: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {children}
    </Box>
  );

  // Always render ElectricBorder to preserve child component state (especially focus)
  // The visibility is controlled by borderConfig.opacity
  return (
    <ElectricBorder
      color={borderConfig.color}
      speed={borderConfig.speed}
      chaos={borderConfig.chaos}
      thickness={borderConfig.thickness}
      effectOpacity={borderConfig.opacity}
      style={{ flex, borderRadius: 8, height: "100%" }}
    >
      {content}
    </ElectricBorder>
  );
});

export default CardWrapper;
