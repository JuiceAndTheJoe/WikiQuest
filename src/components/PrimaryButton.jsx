import Button from "@mui/material/Button";

// A reusable Material UI button component demonstrating third-party usage.
// Keeps logic minimal; any domain/state logic should be passed via props.
function PrimaryButton({
  children,
  onClick,
  variant = "contained",
  color = "primary",
  disabled = false,
  type = "button",
}) {
  return (
    <Button
      variant={variant}
      color={color}
      onClick={onClick}
      disabled={disabled}
      type={type}
      sx={{ textTransform: "none" }}
    >
      {children}
    </Button>
  );
}

export default PrimaryButton;
