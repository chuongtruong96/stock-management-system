import { 
  Box, 
  Pagination, 
  Select, 
  MenuItem, 
  Stack, 
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Chip,
} from "@mui/material";
import {
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
} from "@mui/icons-material";

export default function PaginationBar({
  page,
  totalPages,
  onPageChange,
  pageSize,
  setPageSize,
  totalItems = 0,
}) {
  if (totalPages <= 1) return null;

  const startItem = page * pageSize + 1;
  const endItem = Math.min((page + 1) * pageSize, totalItems);

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 4,
        p: 3,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,249,250,0.9) 100%)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems="center"
        spacing={3}
      >
        {/* Results Info */}
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Showing {startItem}-{endItem} of {totalItems} products
          </Typography>
          
          <Chip
            label={`Page ${page + 1} of ${totalPages}`}
            size="small"
            variant="outlined"
            sx={{
              borderRadius: 2,
              fontWeight: 600,
            }}
          />
        </Stack>

        {/* Pagination Controls */}
        <Stack direction="row" alignItems="center" spacing={3}>
          {/* Page Size Selector */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="body2" color="text.secondary">
              Items per page:
            </Typography>
            <FormControl size="small" sx={{ minWidth: 80 }}>
              <Select
                value={pageSize}
                onChange={(e) => setPageSize(e.target.value)}
                sx={{
                  borderRadius: 2,
                  '& .MuiSelect-select': {
                    py: 1,
                    fontWeight: 600,
                  },
                }}
              >
                {[9, 12, 15, 24].map((n) => (
                  <MenuItem key={n} value={n}>
                    {n}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {/* Pagination */}
          <Pagination
            page={page + 1}
            count={Math.max(1, totalPages)}
            onChange={(_, p) => onPageChange(p - 1)}
            color="primary"
            shape="rounded"
            showFirstButton
            showLastButton
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: 2,
                fontWeight: 600,
                '&.Mui-selected': {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                  },
                },
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              },
              '& .MuiPaginationItem-ellipsis': {
                color: 'text.secondary',
              },
            }}
          />
        </Stack>
      </Stack>
    </Paper>
  );
}