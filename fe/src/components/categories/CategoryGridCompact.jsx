import { Box } from "@mui/material";
import CategoryCard from "./CategoryCard";

export default function CategoryGridCompact({ categories = [], disabled = false }) {
  return (
    <Box
      sx={{
        mt: 4,
        display: "grid",
        gap: 3,
        gridTemplateColumns: {
          xs: "repeat(2, 1fr)",
          sm: "repeat(3, 1fr)",
          lg: "repeat(5, 1fr)",
        },
      }}
    >
      {categories.slice(0, 15).map((c) => (
        <CategoryCard key={c.categoryId} data={c} disabled={disabled} />
      ))}
    </Box>
  );
}