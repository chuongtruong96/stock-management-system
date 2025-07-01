// src/pages/User/Notifications/NotificationsPage.jsx
import { useEffect, useState, useMemo } from "react";
import '../../../css/components/enhanced-notifications.css';
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  Divider,
  Fade,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Badge,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Tooltip,
  Alert,
  Collapse,
  useTheme,
  useMediaQuery,
  Container,
  Grid,
  Skeleton,
  Zoom,
  Slide,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  NotificationsNone as NotificationsNoneIcon,
  Inbox as InboxIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MarkEmailRead as MarkReadIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Assignment as OrderIcon,
  SystemUpdate as SystemIcon,
  LocalOffer as OfferIcon,
  Announcement as AnnouncementIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from "date-fns";

import { useNotifications } from "context/NotificationContext";
import { useTranslation } from "react-i18next";
import { addDemoNotifications } from "../../../utils/notificationDemoData";

// Enhanced notification card component
const NotificationCard = ({ notification, onMarkAsRead, onDelete, index }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);

  const getNotificationIcon = (type) => {
    const iconMap = {
      order: <OrderIcon />,
      system: <SystemIcon />,
      alert: <WarningIcon />,
    };
    return iconMap[type] || <NotificationsIcon />;
  };

  const getNotificationColor = (type, priority) => {
    if (priority === 'high') return theme.palette.error.main;
    if (priority === 'medium') return theme.palette.warning.main;
    
    const colorMap = {
      order: theme.palette.primary.main,
      system: theme.palette.info.main,
      alert: theme.palette.error.main,
    };
    return colorMap[type] || theme.palette.primary.main;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    if (isToday(date)) return format(date, 'HH:mm');
    if (isYesterday(date)) return `${t('yesterday')} ${format(date, 'HH:mm')}`;
    if (isThisWeek(date)) return format(date, 'EEE HH:mm');
    return format(date, 'MMM dd, HH:mm');
  };

  const handleMenuOpen = (event) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleMarkAsRead = () => {
    onMarkAsRead(notification.id);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete(notification.id);
    handleMenuClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        sx={{
          mb: 1.5,
          position: 'relative',
          overflow: 'visible',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: notification.read 
            ? theme.palette.background.paper 
            : theme.palette.action.hover,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[8],
            borderColor: getNotificationColor(notification.type, notification.priority),
          },
        }}
        onClick={() => setExpanded(!expanded)}
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
              backgroundColor: getNotificationColor(notification.type, notification.priority),
              borderRadius: '0 4px 4px 0',
            }}
          />
        )}

        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            {/* Notification Icon */}
            <Avatar
              sx={{
                width: 40,
                height: 40,
                backgroundColor: `${getNotificationColor(notification.type, notification.priority)}20`,
                color: getNotificationColor(notification.type, notification.priority),
              }}
            >
              {getNotificationIcon(notification.type)}
            </Avatar>

            {/* Content */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: notification.read ? 500 : 700,
                    color: notification.read ? 'text.secondary' : 'text.primary',
                    lineHeight: 1.3,
                  }}
                >
                  {notification.title}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {formatTime(notification.createdAt)}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuOpen(e);
                    }}
                    sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
                  >
                    <MoreIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              {/* Tags */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Chip
                  label={notification.type === 'order' ? 'Orders' : notification.type === 'system' ? 'System' : 'Alert'}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    backgroundColor: `${getNotificationColor(notification.type, notification.priority)}15`,
                    color: getNotificationColor(notification.type, notification.priority),
                    fontWeight: 600,
                  }}
                />
                {notification.priority && notification.priority !== 'normal' && (
                  <Chip
                    label={notification.priority}
                    size="small"
                    color={notification.priority === 'high' ? 'error' : 'warning'}
                    sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
                  />
                )}
                {!notification.read && (
                  <Chip
                    label="new"
                    size="small"
                    color="primary"
                    sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
                  />
                )}
              </Box>

              {/* Message Preview */}
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: expanded ? 'none' : 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: 1.4,
                }}
              >
                {notification.message}
              </Typography>

              {/* Expand/Collapse indicator */}
              {notification.message && notification.message.length > 100 && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                  <IconButton size="small" sx={{ color: 'text.secondary' }}>
                    {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>
              )}

              {/* Expanded Content */}
              <Collapse in={expanded}>
                <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                  {notification.metadata && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        details:
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        {Object.entries(notification.metadata).map(([key, value]) => (
                          <Typography key={key} variant="body2" color="text.secondary">
                            <strong>{key}:</strong> {value}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  <Typography variant="caption" color="text.secondary">
                    created: {format(new Date(notification.createdAt), 'PPpp')}
                  </Typography>
                  
                  {notification.read && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      readAt: {format(new Date(notification.readAt || notification.createdAt), 'PPpp')}
                    </Typography>
                  )}
                </Box>
              </Collapse>
            </Box>
          </Box>
        </CardContent>

        {/* Action Menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {!notification.read && (
            <MenuItem onClick={handleMarkAsRead}>
              <CheckIcon sx={{ mr: 1 }} fontSize="small" />
              Mark as read
            </MenuItem>
          )}
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
            Delete
          </MenuItem>
        </Menu>
      </Card>
    </motion.div>
  );
};

// Enhanced empty state component
const EmptyState = ({ hasSearch, onClearSearch, onRefresh }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Paper
        elevation={0}
        sx={{
          py: 8,
          px: 4,
          textAlign: 'center',
          backgroundColor: 'transparent',
          border: `2px dashed ${theme.palette.divider}`,
          borderRadius: 3,
        }}
      >
        <motion.div
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3
          }}
        >
          {hasSearch ? (
            <SearchIcon sx={{ fontSize: 80, color: theme.palette.primary.main, mb: 2 }} />
          ) : (
            <NotificationsNoneIcon sx={{ fontSize: 80, color: theme.palette.primary.main, mb: 2 }} />
          )}
        </motion.div>
        
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
          {hasSearch ? 'No search results' : 'No notifications'}
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
          {hasSearch 
            ? 'Try adjusting your search terms or clear the search to see all notifications.'
            : 'You\'re all caught up! New notifications will appear here when they arrive.'
          }
        </Typography>
        
        <Stack direction="row" spacing={2} justifyContent="center">
          {hasSearch && (
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={onClearSearch}
            >
              Clear search
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
            sx={{
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)',
              },
            }}
          >
            Refresh
          </Button>
        </Stack>
      </Paper>
    </motion.div>
  );
};

export default function NotificationsPage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { items, markAsRead, markAll } = useNotifications();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [loading, setLoading] = useState(false);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);

  // Use demo data if no real notifications exist (for demonstration purposes)
  const allNotifications = useMemo(() => {
    return addDemoNotifications(items);
  }, [items]);

  // Statistics
  const stats = useMemo(() => ({
    total: allNotifications.length,
    unread: allNotifications.filter(n => !n.read).length,
    read: allNotifications.filter(n => n.read).length,
    today: allNotifications.filter(n => isToday(new Date(n.createdAt))).length,
  }), [allNotifications]);

  // Filter and search notifications
  const filteredNotifications = useMemo(() => {
    let filtered = allNotifications;

    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter(n => n.type === filterType);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(query) ||
        n.message.toLowerCase().includes(query)
      );
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [allNotifications, filterType, searchQuery]);

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    const groups = {};
    filteredNotifications.forEach(notification => {
      const date = new Date(notification.createdAt);
      let groupKey;
      
      if (isToday(date)) {
        groupKey = 'today';
      } else if (isYesterday(date)) {
        groupKey = 'yesterday';
      } else if (isThisWeek(date)) {
        groupKey = 'this week';
      } else if (isThisMonth(date)) {
        groupKey = 'this month';
      } else {
        groupKey = 'older';
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(notification);
    });
    
    return groups;
  }, [filteredNotifications]);

  const handleRefresh = async () => {
    setLoading(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const handleDeleteNotification = (id) => {
    // Implement delete functionality
    console.log('Delete notification:', id);
  };

  // Handle clickable stats
  const handleStatsClick = (filterKey) => {
    if (filterKey === 'unread') {
      // Show only unread notifications
      setFilterType('all');
      // We'll need to add a separate unread filter
    } else if (filterKey === 'today') {
      // Show only today's notifications
      setFilterType('all');
      // We'll need to add a date filter
    } else {
      setFilterType(filterKey);
    }
  };

  const filterTypes = [
    { key: 'all', label: 'All' },
    { key: 'order', label: 'Orders' },
    { key: 'system', label: 'System' },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Fade in timeout={600}>
        <Box>
          {/* Header Section */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Badge badgeContent={stats.unread} color="error" max={99}>
                    <NotificationsIcon 
                      sx={{ 
                        fontSize: 32, 
                        color: theme.palette.primary.main 
                      }} 
                    />
                  </Badge>
                  <Typography variant="h4" fontWeight={700} color="text.primary">
                    Notifications
                  </Typography>
                </Box>
                
                {/* Clickable Statistics */}
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <Chip 
                    label={`${stats.total} total`}
                    variant="outlined"
                    size="small"
                    sx={{ fontWeight: 600, cursor: 'pointer' }}
                    onClick={() => handleStatsClick('all')}
                  />
                  <Chip 
                    label={`${stats.unread} unread`}
                    color="primary"
                    size="small"
                    sx={{ fontWeight: 600, cursor: 'pointer' }}
                    onClick={() => handleStatsClick('unread')}
                  />
                  <Chip 
                    label={`${stats.today} today`}
                    color="secondary"
                    size="small"
                    sx={{ fontWeight: 600, cursor: 'pointer' }}
                    onClick={() => handleStatsClick('today')}
                  />
                </Stack>
              </Box>
              
              <Stack direction="row" spacing={1}>
                <Tooltip title="Refresh">
                  <IconButton 
                    onClick={handleRefresh} 
                    disabled={loading}
                    sx={{
                      backgroundColor: theme.palette.action.hover,
                      '&:hover': {
                        backgroundColor: theme.palette.action.selected,
                      },
                    }}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                
                {stats.unread > 0 && (
                  <Button
                    variant="contained"
                    startIcon={<MarkReadIcon />}
                    onClick={markAll}
                    sx={{
                      background: 'linear-gradient(45deg, #4caf50 30%, #8bc34a 90%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #388e3c 30%, #689f38 90%)',
                      },
                      fontWeight: 600,
                    }}
                  >
                    Mark all read
                  </Button>
                )}
              </Stack>
            </Box>

            {/* Search and Filter Bar */}
            <Paper
              elevation={2}
              sx={{
                p: 2,
                borderRadius: 3,
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                <TextField
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setSearchQuery('')}>
                          <CloseIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ 
                    flexGrow: 1,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                  size="small"
                />
                
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
                  sx={{ 
                    minWidth: 120,
                    borderRadius: 2,
                    fontWeight: 600,
                  }}
                >
                  {filterTypes.find(f => f.key === filterType)?.label}
                </Button>
                
                <Menu
                  anchorEl={filterMenuAnchor}
                  open={Boolean(filterMenuAnchor)}
                  onClose={() => setFilterMenuAnchor(null)}
                >
                  {filterTypes.map((type) => (
                    <MenuItem
                      key={type.key}
                      selected={filterType === type.key}
                      onClick={() => {
                        setFilterType(type.key);
                        setFilterMenuAnchor(null);
                      }}
                    >
                      {type.label}
                    </MenuItem>
                  ))}
                </Menu>
              </Stack>
            </Paper>
          </Box>

          {/* Loading State */}
          {loading && (
            <Box sx={{ mb: 3 }}>
              {[...Array(3)].map((_, index) => (
                <Card key={index} sx={{ mb: 1.5 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Skeleton variant="circular" width={40} height={40} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="60%" height={24} />
                        <Skeleton variant="text" width="80%" height={20} />
                        <Skeleton variant="text" width="40%" height={16} />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          {/* Notifications List */}
          {!loading && filteredNotifications.length > 0 ? (
            <AnimatePresence>
              {Object.entries(groupedNotifications).map(([groupName, notifications]) => (
                <motion.div
                  key={groupName}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Box sx={{ mb: 4 }}>
                    <Typography 
                      variant="h6" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2, 
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        '&::after': {
                          content: '""',
                          flex: 1,
                          height: 1,
                          backgroundColor: theme.palette.divider,
                          ml: 2,
                        },
                      }}
                    >
                      {groupName}
                    </Typography>
                    
                    {notifications.map((notification, index) => (
                      <NotificationCard
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={markAsRead}
                        onDelete={handleDeleteNotification}
                        index={index}
                      />
                    ))}
                  </Box>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : !loading && (
            <EmptyState 
              hasSearch={!!searchQuery || filterType !== 'all'}
              onClearSearch={() => {
                setSearchQuery('');
                setFilterType('all');
              }}
              onRefresh={handleRefresh}
            />
          )}
        </Box>
      </Fade>
    </Container>
  );
}