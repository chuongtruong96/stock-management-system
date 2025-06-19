import React from "react";
import { ListItem, ListItemText } from "@mui/material";

export default function OrderItem({ item }) {
  return (
    <ListItem>
      <ListItemText
        primary={item.productName}
        secondary={`Qty: ${item.quantity}`}
      />
    </ListItem>
  );
}
