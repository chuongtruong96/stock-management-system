import React, { useState } from "react";
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Box,
  Divider,
  Button,
  Chip,
  Stack,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  NotificationsNone as NotificationsNoneIcon,
  Circle as CircleIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { useNotifications } from "../../context/NotificationContext";
import { notificationApi } from "../../services/api";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const getNotificationIcon = (type) => {
  switch (type) {
    case 'success':
      return <CheckCircleIcon color="success" />;
    case 'warning':
      return <WarningIcon color="warning" />;
    case 'error':
      return <ErrorIcon color="error" />;
    default:
      return <InfoIcon color="info" />;
  }
};

const getNotificationColor = (type) => {
  switch (type) {
    case 'success':
      return '#4caf50';
    case 'warning':
      return '#ff9800';
    case 'error':
      return '#f44336';
    default:
      return '#2196f3';
  }
};

export default function NotificationBell() {
  const { items, markAsRead: localMark } = useNotifications();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const unread = items.filter((i) => !i.read).length;

  const [anchor, setAnchor] = useState(null);
  const open = Boolean(anchor);

  const handleOpen = (e) => setAnchor(e.currentTarget);
  const handleClose = () => setAnchor(null);

  const handleMarkAsRead = async (notification) => {
    try {
      await notificationApi.markRead(notification.id);
      localMark(notification.id);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleViewAll = () => {
    handleClose();
    navigate('/notifications');
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleOpen}
        sx={{
          position: 'relative',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        <Badge
          badgeContent={unread}
          color="error"
          sx={{
            '& .MuiBadge-badge': {
              fontSize: '0.75rem',
              minWidth: '18px',
              height: '18px',
            },
          }}
        >
          {unread > 0 ? (
            <NotificationsIcon />
          ) : (
            <NotificationsNoneIcon />
          )}
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchor}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 380,
            maxHeight: 480,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid',
            borderColor: 'divider',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={600}>
              {t('nav.notifications')}
            </Typography>
            {unread > 0 && (
              <Chip
                label={`${unread} new`}
                size="small"
                color="primary"
                sx={{ fontSize: '0.75rem' }}
              />
            )}
          </Stack>
        </Box>

        {/* Notifications List */}
        <Box sx={{ maxHeight: 320, overflowY: 'auto' }}>
          {items.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <NotificationsNoneIcon
                sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                {t('nav.noNotifications')}
              </Typography>
            </Box>
          ) : (
            items.slice(0, 5).map((notification) => (
              <MenuItem
                key={notification.id}
                onClick={() => handleMarkAsRead(notification)}
                sx={{
                  p: 2,
                  alignItems: 'flex-start',
                  bgcolor: notification.read ? 'transparent' : 'action.hover',
                  borderLeft: notification.read ? 'none' : '4px solid',
                  borderLeftColor: getNotificationColor(notification.type),
                  '&:hover': {
                    bgcolor: 'action.selected',
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor: notification.read ? 'grey.100' : getNotificationColor(notification.type),
                      color: notification.read ? 'text.secondary' : 'white',
                      width: 40,
                      height: 40,
                    }}
                  >
                    {getNotificationIcon(notification.type)}
                  </Avatar>
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Typography
                        variant="subtitle2"
                        fontWeight={notification.read ? 400 : 600}
                        sx={{ flex: 1, mr: 1 }}
                      >
                        {notification.title}
                      </Typography>
                      {!notification.read && (
                        <CircleIcon
                          sx={{
                            fontSize: 8,
                            color: 'primary.main',
                            mt: 0.5,
                          }}
                        />
                      )}
                    </Stack>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {notification.message}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 0.5, display: 'block' }}
                      >
                        {formatTimeAgo(notification.createdAt)}
                      </Typography>
                    </Box>
                  }
                />
              </MenuItem>
            ))
          )}
        </Box>

        {/* Footer */}
        {items.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 1 }}>
              <Button
                fullWidth
                variant="text"
                onClick={handleViewAll}
                sx={{
                  py: 1,
                  textTransform: 'none',
                  fontWeight: 500,
                }}
              >
                View All Notifications
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
}