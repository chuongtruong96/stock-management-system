import { Box, CircularProgress, Alert } from "@mui/material";

export default function ContentState({ loading, error, empty, children }) {
  if (loading)
    return (
      <Box py={10} textAlign="center">
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Box py={10} textAlign="center">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  if (empty)
    return (
      <Box py={6} textAlign="center" color="text.secondary">
        {empty}
      </Box>
    );
  return children;
}