import { useState } from "react";
import { useParams }  from "react-router-dom";
import {
  Typography, Button, Box, Grid, Skeleton
} from "@mui/material";
import { useCart}     from "context/CartContext";
import { useProducts } from "hooks/useProducts";
import QuantitySelector from "components/QuantitySelector";
import { toast } from "react-toastify";

export default function ProductDetail() {
  const { id }                 = useParams();
  const { product, loading }   = useProducts(null, id);
  const { addItem }            = useCart();
  const [qty, setQty]          = useState(1);

  if (loading || !product)
    return (<Box p={4}><Skeleton variant="rectangular" height={400} /></Box>);

  return (
    <Grid container spacing={4} p={3}>
      <Grid item xs={12} md={6}>
        <img src={product.imageUrl || "/placeholder-prod.png"} width="100%" alt={product.name}/>
      </Grid>
      <Grid item xs={12} md={6}>
        <Typography variant="h4" gutterBottom>{product.name}</Typography>
        <Typography variant="body1" paragraph>
          {product.description || "No description"}
        </Typography>

        <QuantitySelector value={qty} setValue={setQty} min={1}/>
        <Button variant="contained" sx={{ mt:2 }} onClick={()=>{
          addItem(product, qty); toast.success("Added to cart");
        }}>
          Add to Cart
        </Button>
      </Grid>
    </Grid>
  );
}
