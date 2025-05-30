// ─ File: src/components/QuantitySelector.jsx
import { IconButton, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
export default function QuantitySelector({ value, setValue, min = 1, small = false }) {
  const step = 1;
  const size = small ? "small" : "medium";
  return (
    <>
      <IconButton size={size} onClick={() => value > min && setValue(value - step)}>
        <RemoveIcon fontSize={size} />
      </IconButton>
      <TextField
        value={value}
        onChange={(e) => setValue(Math.max(min, Number(e.target.value)))}
        size={size}
        inputProps={{ style: { textAlign: "center", width: small ? 40 : 60 } }}
      />
      <IconButton size={size} onClick={() => setValue(value + step)}>
        <AddIcon fontSize={size} />
      </IconButton>
    </>
  );
}