import { Grid, Avatar, Typography } from "@mui/material";
import MDBox from "components/template/MDBox";
import { getCategoryIconUrl } from "utils/apiUtils";

export default function CategoryBar({ list = [], active, onSelect }) {
  return (
    <Grid container spacing={2}>
      {list.map((c) => (
        <Grid item xs={3} sm={2} md={1.5} key={c.categoryId}>
          <MDBox
            onClick={() => onSelect(c.categoryId)}
            sx={{
              cursor: "pointer",
              textAlign: "center",
              opacity: active === c.categoryId ? 1 : 0.6,
              "&:hover": { opacity: 1 },
            }}
          >
            <Avatar
              src={
                c?.icon && c.icon !== 'null' && c.icon !== 'undefined'
                  ? c.icon.startsWith("http")
                    ? c.icon
                    : getCategoryIconUrl(c.icon)
                  : "/assets/icons/placeholder.svg" // fallback ảnh mặc định
              }
              sx={{ width: 64, height: 64, mx: "auto", mb: 1 }}
            />
            <Typography variant="caption">{c.name}</Typography>
          </MDBox>
        </Grid>
      ))}
    </Grid>
  );
}
