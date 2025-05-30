import { List, ListItemButton, ListItemText, ListSubheader, Badge, Box } from "@mui/material";

export default function CategorySidebar({ list = [], active = [], onSelect, sticky = true }) {
  const total = list.reduce((s, c) => s + (c.productCount ?? 0), 0) || list.length;
  const isAll = active.length === 0;
  const sxSticky = sticky ? { position: "sticky", top: 96 } : {};

  return (
    <Box sx={sxSticky}>
      <List
        dense
        subheader={<ListSubheader disableSticky sx={{ fontWeight: 700 }}>CATEGORY</ListSubheader>}
        sx={{ bgcolor: "grey.50", border: 1, borderColor: "grey.200", borderRadius: 2, maxHeight: "75vh", overflow: "auto" }}
      >
        <ListItemButton selected={isAll} onClick={() => onSelect(null)}>
          <ListItemText primary="All products" primaryTypographyProps={{ fontWeight: isAll ? 700 : 500 }} />
          <Badge color="primary" badgeContent={total} sx={{ mr: 1 }} />
        </ListItemButton>

        {list.map((c) => {
          const selected = active.includes(c.categoryId);
          return (
            <ListItemButton key={c.categoryId} selected={selected} onClick={() => onSelect(c.categoryId)}>
              <ListItemText primary={c.nameEn || c.nameVn || c.code} primaryTypographyProps={{ fontWeight: selected ? 700 : 500 }} />
              {c.productCount !== undefined && <Badge color="secondary" badgeContent={c.productCount} sx={{ mr: 1 }} />}
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}