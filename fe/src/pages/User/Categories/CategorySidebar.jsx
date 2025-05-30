import {
  List, ListItemButton, ListItemText,
  ListSubheader, Badge, Box
} from "@mui/material";

export default function CategorySidebar({ list=[], active, onSelect }) {
  const total = list.reduce((s,c)=>s+(c.productCount??0),0) || list.length;

  return (
    <Box sx={{ position:"sticky", top:96 }}>
      <List
        dense
        subheader={
          <ListSubheader disableSticky sx={{ fontWeight:700 }}>CATEGORY</ListSubheader>}
        sx={{
          bgcolor:"grey.50", border:"1px solid", borderColor:"grey.200",
          borderRadius:2
        }}
      >
        <ListItemButton selected={active===null} onClick={()=>onSelect(null)}>
          <ListItemText primaryTypographyProps={{ fontWeight: active===null?700:500 }}
                        primary="All products"/>
          <Badge color="primary" badgeContent={total} sx={{ mr:1 }}/>
        </ListItemButton>

        {list.map(c=>(
          <ListItemButton key={c.categoryId}
                          selected={active===c.categoryId}
                          onClick={()=>onSelect(c.categoryId)}>
            <ListItemText
              primaryTypographyProps={{ fontWeight: active===c.categoryId?700:500 }}
              primary={c.nameEn||c.nameVn||c.code}/>
            <Badge color="secondary" badgeContent={c.productCount} sx={{ mr:1 }}/>
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}
