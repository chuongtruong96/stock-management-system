import React from "react";
import { Link } from "react-router-dom";
import { ListItem, ListItemText } from "@mui/material";
import StatusBadge from "components/indicators/StatusBadge";

export default function OrderHistoryItem({ order }) {
  return (
    <ListItem component={Link} to={`/orders/${order.orderId}`} button>
      <ListItemText
        primary={`#${order.orderId}`}
        secondary={new Date(order.createdAt).toLocaleString()}
      />
      <StatusBadge status={order.status} />
    </ListItem>
  );
}
