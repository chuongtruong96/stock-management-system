import { Card, CardMedia, CardContent, Typography, Button } from "@mui/material";

export default function ProductCard({ p, onAdd, lang }) {
  return (
    <Card sx={{ height:"100%", display:"flex", flexDirection:"column" }}>
      <CardMedia
        image={ p.image ? `/assets/prod/${p.image}` : '/placeholder.png'}
        sx={{ pt:"100%" }}       /* 1:1 ratio */
      />
      <CardContent sx={{ flexGrow:1 }}>
        <Typography variant="subtitle2" gutterBottom noWrap>{p.name}</Typography>
        <Typography variant="body2" color="text.secondary">{p.unit}</Typography>
        
      </CardContent>
      <Button onClick={()=>onAdd(p)} variant="contained">
        {lang==="vi"?"Thêm":"Add"}
      </Button>
    </Card>
  );
}
