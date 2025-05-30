// src/components/Loading.jsx
import { Box, CircularProgress } from "@mui/material";

export default function Loading() {
  return (
    <Box
      sx={{ height:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}
    >
      <CircularProgress />
    </Box>
  );
}
