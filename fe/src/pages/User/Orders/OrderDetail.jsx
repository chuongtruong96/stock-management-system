import React from "react";
import { Typography, Box, List, Skeleton } from "@mui/material";
import { useParams } from "react-router-dom";
import { useCheckout } from "hooks/useCheckout";
import StatusBadge from "components/indicators/StatusBadge";
import OrderItem from "./OrderItem"; // ⬅️ NEW COMPONENT

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
        {order.items.map((item) => (
          <OrderItem key={item.productId} item={item} />
        ))}
      </List>
    </Box>
  );
}
