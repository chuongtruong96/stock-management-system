import React from "react";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import StatusBadge from "components/StatusBadge";
import { useCheckout } from "hooks/useCheckout";  // variant returns orders list
import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
import { useNavigate } from "react-router-dom";
export default function OrderHistory() {
  const navigate = useNavigate();
  const { history, loading } = useCheckout(); // variant returns orders list

  if (loading) return <Skeleton height={300} />;
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Order History
      </Typography>
      <List>
        {history.map((o) => (
          <ListItem
            key={o.orderId}
            button
            component={Link}
            to={`/orders/${o.orderId}`}
          >
            <ListItemText primary={`#${o.orderId}`} secondary={new Date(o.createdAt).toLocaleString()} />
            <StatusBadge status={o.status} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}