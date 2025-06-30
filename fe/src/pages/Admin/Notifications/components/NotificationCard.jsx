import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  Box,
  Typography,
  IconButton,
  Chip,
  Avatar,
  Checkbox,
  Menu,
  MenuItem,
  Collapse,
  Button,
  useTheme,
  alpha,
  Tooltip
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  LocalOffer as OfferIcon,
  SystemUpdate as SystemIcon,
  Assignment as OrderIcon,
  Announcement as AnnouncementIcon,
  MoreVert as MoreIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  MarkEmailRead as MarkReadIcon,
  Delete as DeleteIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { formatDistanceToNow, format } from 'date-fns';
import { enUS, vi } from 'date-fns/locale';

const NotificationCard = ({
  notification,
  selected,
  onSelect,
  onMarkAsRead,
  onDelete,
  showSelection = false
}) => {
  const { t, i18n } = useTranslation('notifications');
  const theme = useTheme();
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const locale = i18n.language === 'vi' ? vi : enUS;

  // Get notification type icon and color
  const getNotificationTypeInfo = (type) => {
    const typeMap = {
      order: { icon: OrderIcon, color: theme.palette.primary.main, bgColor: alpha(theme.palette.primary.main, 0.1) },
      system: { icon: SystemIcon, color: theme.palette.info.main, bgColor: alpha(theme.palette.info.main, 0.1) },
      promotion: { icon: OfferIcon, color: theme.palette.secondary.main, bgColor: alpha(theme.palette.secondary.main, 0.1) },
      reminder: { icon: ScheduleIcon, color: theme.palette.warning.main, bgColor: alpha(theme.palette.warning.main, 0.1) },
      alert: { icon: WarningIcon, color: theme.palette.error.main, bgColor: alpha(theme.palette.error.main, 0.1) },
      update: { icon: AnnouncementIcon, color: theme.palette.success.main, bgColor: alpha(theme.palette.success.main, 0.1) },
      default: { icon: InfoIcon, color: theme.palette.grey[500], bgColor: alpha(theme.palette.grey[500], 0.1) }
    };
    return typeMap[type] || typeMap.default;
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    const priorityMap = {
      urgent: theme.palette.error.main,
      high: theme.palette.warning.main,
      medium: theme.palette.info.main,
      low: theme.palette.success.main,
      normal: theme.palette.grey[500]
    };
    return priorityMap[priority] || priorityMap.normal;
  };

  const typeInfo = getNotificationTypeInfo(notification.type);
  const TypeIcon = typeInfo.icon;

  // Format time
  const formatTime = (date) => {
    const notifDate = new Date(date);
    const now = new Date();
    const diffInHours = (now - notifDate) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return formatDistanceToNow(notifDate, { addSuffix: true, locale });
    } else {
      return format(notifDate, 'MMM dd, yyyy HH:mm', { locale });
    }
  };

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleMarkAsRead = (event) => {
    event.stopPropagation();
    onMarkAsRead();
    handleMenuClose();
  };

  const handleDelete = (event) => {
    event.stopPropagation();
    onDelete();
    handleMenuClose();
  };

  const handleCardClick = () => {
    if (showSelection) {
      onSelect();
    } else {
      setExpanded(!expanded);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        sx={{
          mb: 1,
          cursor: 'pointer',
          border: selected ? `2px solid ${theme.palette.primary.main}` : '1px solid',
          borderColor: selected ? theme.palette.primary.main : theme.palette.divider,
          backgroundColor: notification.read 
            ? theme.palette.background.paper 
            : alpha(theme.palette.primary.main, 0.02),
          position: 'relative',
          overflow: 'visible',
          '&:hover': {
            boxShadow: theme.shadows[4],
            borderColor: theme.palette.primary.main
          },
          transition: 'all 0.2s ease-in-out'
        }}
        onClick={handleCardClick}
      >
        {/* Unread indicator */}
        {!notification.read && (
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 4,
              backgroundColor: theme.palette.primary.main,
              borderRadius: '0 4px 4px 0'
            }}
          />
        )}

        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box display="flex" alignItems="flex-start" gap={2}>
            {/* Selection checkbox */}
            {showSelection && (
              <Checkbox
                checked={selected}
                onChange={onSelect}
                onClick={(e) => e.stopPropagation()}
                size="small"
              />
            )}

            {/* Notification icon */}
            <Avatar
              sx={{
                width: 40,
                height: 40,
                backgroundColor: typeInfo.bgColor,
                color: typeInfo.color
              }}
            >
              <TypeIcon />
            </Avatar>

            {/* Content */}
            <Box flexGrow={1} minWidth={0}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                <Box flexGrow={1} minWidth={0}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: notification.read ? 400 : 600,
                      color: notification.read ? 'text.secondary' : 'text.primary',
                      mb: 0.5
                    }}
                    noWrap
                  >
                    {notification.title}
                  </Typography>
                  
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Chip
                      label={t(`notificationTypes.${notification.type}`) || notification.type}
                      size="small"
                      sx={{
                        backgroundColor: typeInfo.bgColor,
                        color: typeInfo.color,
                        fontWeight: 500,
                        fontSize: '0.75rem'
                      }}
                    />
                    
                    {notification.priority && notification.priority !== 'normal' && (
                      <Chip
                        label={t(notification.priority)}
                        size="small"
                        sx={{
                          backgroundColor: alpha(getPriorityColor(notification.priority), 0.1),
                          color: getPriorityColor(notification.priority),
                          fontWeight: 500,
                          fontSize: '0.75rem'
                        }}
                      />
                    )}
                  </Box>
                </Box>

                {/* Actions */}
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Tooltip title={formatTime(notification.createdAt)}>
                    <Box display="flex" alignItems="center" gap={0.5} sx={{ color: 'text.secondary' }}>
                      <TimeIcon sx={{ fontSize: 14 }} />
                      <Typography variant="caption">
                        {formatTime(notification.createdAt)}
                      </Typography>
                    </Box>
                  </Tooltip>
                  
                  <IconButton
                    size="small"
                    onClick={handleMenuOpen}
                    sx={{ ml: 1 }}
                  >
                    <MoreIcon />
                  </IconButton>
                </Box>
              </Box>

              {/* Message preview */}
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: expanded ? 'none' : 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: 1.4,
                  mb: 1
                }}
              >
                {notification.message}
              </Typography>

              {/* Expand/Collapse button */}
              {notification.message && notification.message.length > 100 && (
                <Button
                  size="small"
                  startIcon={expanded ? <CollapseIcon /> : <ExpandIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(!expanded);
                  }}
                  sx={{ mt: 1, p: 0, minWidth: 'auto' }}
                >
                  {expanded ? t('showLess') : t('showMore')}
                </Button>
              )}

              {/* Additional details when expanded */}
              <Collapse in={expanded}>
                <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                  {notification.metadata && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        {t('details')}:
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        {Object.entries(notification.metadata).map(([key, value]) => (
                          <Typography key={key} variant="body2" color="text.secondary">
                            <strong>{key}:</strong> {value}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      {t('created')}: {format(new Date(notification.createdAt), 'PPpp', { locale })}
                    </Typography>
                    
                    {notification.read && (
                      <Typography variant="caption" color="text.secondary">
                        {t('readAt')}: {format(new Date(notification.readAt || notification.createdAt), 'PPpp', { locale })}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Collapse>
            </Box>
          </Box>
        </CardContent>

        {/* Context menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          onClick={(e) => e.stopPropagation()}
        >
          {!notification.read && (
            <MenuItem onClick={handleMarkAsRead}>
              <MarkReadIcon sx={{ mr: 1 }} />
              {t('markAsRead')}
            </MenuItem>
          )}
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 1 }} />
            {t('delete')}
          </MenuItem>
        </Menu>
      </Card>
    </motion.div>
  );
};

export default NotificationCard;