// src/components/shop/QuantitySelector.jsx
import { IconButton, Box, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

export default function QuantitySelector({
  value,
  setValue,
  min = 1,
  max = 999,
  size = "medium",
}) {
  const inc = () => value < max && setValue(value + 1);
  const dec = () => value > min && setValue(value - 1);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        border: "1px solid",
        borderColor: "grey.300",
        borderRadius: 1,
      }}
    >
      <IconButton size={size} onClick={dec}>
        <RemoveIcon fontSize="inherit" />
      </IconButton>
      <Typography
        variant="subtitle2"
        sx={{ width: 28, textAlign: "center", pointerEvents: "none" }}
      >
        {value}
      </Typography>
      <IconButton size={size} onClick={inc}>
        <AddIcon fontSize="inherit" />
      </IconButton>
    </Box>
  );
}
