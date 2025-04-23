import React from 'react';
import { List, ListItem, ListItemText, Divider, Typography } from '@mui/material';
import { useNotifications } from '../contexts/NotificationContext';

export default function NotificationsPage() {
  const { items, markAsRead } = useNotifications();
  return <>
    <Typography variant="h4" gutterBottom>Notifications</Typography>
    <List>
      {items.map(i => (
        <React.Fragment key={i.id}>
          <ListItem button selected={!i.read} onClick={()=>markAsRead(i.id)}>
            <ListItemText
              primary={i.title}
              secondary={i.message}
            />
          </ListItem>
          <Divider />
        </React.Fragment>
      ))}
      {items.length===0 && <Typography>No notifications</Typography>}
    </List>
  </>;
}