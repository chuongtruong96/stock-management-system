import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import StatusBadge from "components/StatusBadge";
import { useParams } from "react-router-dom";
import { useCheckout } from "hooks/useCheckout";  // variant returns orders list
import Skeleton from "@mui/material/Skeleton";
import ListItemText from "@mui/material/ListItemText";

export default function OrderDetail() {
  const { id } = useParams();
  const { order, loading } = useCheckout(null, id); // fetch one order

  if (loading) return <Skeleton height={400} />;
  if (!order) return <Typography p={4}>Order not found</Typography>;

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Order #{order.orderId}
      </Typography>
      <StatusBadge status={order.status} />
      <List sx={{ mt: 2 }}>
        {order.items.map((it) => (
          <ListItem key={it.productId}>
            <ListItemText primary={it.productName} secondary={`Qty: ${it.quantity}`} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}