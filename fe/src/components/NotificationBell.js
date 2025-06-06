import React, { useState } from "react";
import { Badge, IconButton, Menu, MenuItem, ListItemText } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useNotifications } from "../context/NotificationContext";
import { notificationApi } from "../services/api"; // Updated import

export default function NotificationBell() {
  const { items, markAsRead: localMark } = useNotifications();
  const unread = items.filter((i) => !i.read).length;
  const [anchor, setAnchor] = useState(null);

  const open = (e) => setAnchor(e.currentTarget);
  const close = () => setAnchor(null);
  const onClick = (i) => {
    notificationApi.markRead(i.id).then(() => localMark(i.id)); // Updated to notificationApi.markRead
    close();
  };

  return (
    <>
      <IconButton color="inherit" onClick={open}>
        <Badge badgeContent={unread} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu anchorEl={anchor} open={!!anchor} onClose={close}>
        {items.slice(0, 5).map((i) => (
          <MenuItem
            key={i.id}
            onClick={() => onClick(i)}
            selected={!i.read}
          >
            <ListItemText primary={i.title} secondary={i.message} />
          </MenuItem>
        ))}
        {items.length === 0 && <MenuItem disabled>No notifications</MenuItem>}
        <MenuItem component="a" href="/notifications">
          See all…
        </MenuItem>
      </Menu>
    </>
  );
}