import { Box, Pagination, Select, MenuItem, Stack } from "@mui/material";
import "../../css/components/PaginationBar.css";

export default function PaginationBar({
  page,
  totalPages,
  onPageChange,
  pageSize,
  setPageSize,
}) {
  if (totalPages <= 1) return null;

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems="center"
      spacing={2}
      className="pagination-bar"
    >
      <Pagination
        color="primary"
        page={page + 1}
        count={totalPages}
        onChange={(_, p) => onPageChange(p - 1)}
      />

      <Box>
        Rows / page:
        <Select
          size="small"
          value={pageSize}
          onChange={(e) => setPageSize(e.target.value)}
        >
          {[9, 12, 15].map((n) => (
            <MenuItem key={n} value={n}>
              {n}
            </MenuItem>
          ))}
        </Select>
      </Box>
    </Stack>
  );
}