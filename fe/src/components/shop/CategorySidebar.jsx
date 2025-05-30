import {
  List,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Badge,
  Box,
} from "@mui/material";
import "../../css/components/CategorySidebar.css";

export default function CategorySidebar({
  list = [],
  active,
  onSelect,
  sticky = true,
}) {
  const total =
    list.reduce((s, c) => s + (c.productCount ?? 0), 0) || list.length;

  return (
    <Box sx={sticky ? { position: "sticky", top: 96 } : {}} className="category-sidebar">
      <List
        dense
        subheader={
          <ListSubheader disableSticky sx={{ fontWeight: 700 }}>
            CATEGORY
          </ListSubheader>
        }
        sx={{
          bgcolor: "grey.50",
          border: 1,
          borderColor: "grey.200",
          borderRadius: 2,
          maxHeight: "75vh",
          overflow: "auto",
        }}
      >
        {/* --- All --- */}
        <ListItemButton selected={active === null} onClick={() => onSelect(null)}>
          <ListItemText
            primary="All products"
            primaryTypographyProps={{
              fontWeight: active === null ? 700 : 500,
            }}
          />
          <Badge color="primary" badgeContent={total} sx={{ mr: 1 }} />
        </ListItemButton>

        {/* --- each category --- */}
        {list.map((c) => (
          <ListItemButton
            key={c.categoryId}
            selected={active === c.categoryId}
            onClick={() => onSelect(c.categoryId)}
          >
            <ListItemText
              primary={c.nameEn || c.nameVn || c.code}
              primaryTypographyProps={{
                fontWeight: active === c.categoryId ? 700 : 500,
              }}
            />
            {c.productCount !== undefined && (
              <Badge color="secondary" badgeContent={c.productCount} sx={{ mr: 1 }} />
            )}
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}