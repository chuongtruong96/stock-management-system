import {
  Box,
  Stack,
  TextField,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Select,
  MenuItem,
  Typography,
  Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ViewListIcon from "@mui/icons-material/ViewList";
import "../../css/components/ToolbarFilter.css"; // Ensure the correct path to the CSS file

export default function ToolbarFilter({
  keyword,
  setKeyword,
  view,
  setView,
  pageSize,
  setPageSize,
  sort,
  setSort,
  categories,
  selectedCats,
  onToggleCat,
}) {
  return (
    <Paper elevation={0} className="toolbar-filter" sx={{ p: 2, mb: 3, border: 1, borderColor: "grey.300" }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center" justifyContent="space-between" mb={2}>
        <TextField
          size="small"
          placeholder="Search products…"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          sx={{ width: { xs: "100%", sm: 260 } }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        />
        <Stack direction="row" spacing={2} alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2">Show</Typography>
            <ToggleButtonGroup size="small" exclusive value={pageSize} onChange={(_, v) => v && setPageSize(v)}>
              {[9, 12, 15].map((n) => <ToggleButton key={n} value={n}>{n}</ToggleButton>)}
            </ToggleButtonGroup>
          </Stack>
          <Select size="small" value={sort} onChange={(e) => setSort(e.target.value)}>
            <MenuItem value="default">Default</MenuItem>
            <MenuItem value="nameAsc">Name A–Z</MenuItem>
            <MenuItem value="nameDesc">Name Z–A</MenuItem>
            <MenuItem value="priceAsc">Price ↑</MenuItem>
            <MenuItem value="priceDesc">Price ↓</MenuItem>
          </Select>
        </Stack>
        <ToggleButtonGroup size="small" exclusive value={view} onChange={(_, v) => v && setView(v)}>
          <ToggleButton value="grid"><ViewModuleIcon fontSize="small" /></ToggleButton>
          <ToggleButton value="list"><ViewListIcon fontSize="small" /></ToggleButton>
        </ToggleButtonGroup>
      </Stack>
      <Box sx={{ p: 1, border: 1, borderColor: "grey.300", borderRadius: 2, display: "flex", flexWrap: "wrap", gap: 1, maxHeight: 120, overflowY: "auto" }}>
        {categories.map((c) => {
          const selected = selectedCats.includes(c.categoryId);
          return (<Chip key={c.categoryId} label={c.nameEn || c.nameVn || c.code} color={selected ? "secondary" : "default"} variant={selected ? "filled" : "outlined"} onClick={() => onToggleCat(c.categoryId)} />);
        })}
      </Box>
    </Paper>
  );
}