import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Fab,
  Tooltip,
  Divider,
  Alert,
  Skeleton,
  Badge,
  useTheme,
  useMediaQuery,
  Snackbar
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  MarkEmailRead as MarkReadIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  NotificationsNone as NotificationsIcon,
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
  KeyboardArrowDown as ArrowDownIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/template/MDBox";

import { useNotifications } from "context/NotificationContext";
import NotificationCard from './components/NotificationCard';
import NotificationFilters from './components/NotificationFilters';
import NotificationSettings from './components/NotificationSettings';
import EmptyState from './components/EmptyState';
import BulkActions from './components/BulkActions';

// Custom hooks
import { useNotificationFilters } from './hooks/useNotificationFilters';
import { useNotificationSearch } from './hooks/useNotificationSearch';
import { useNotificationActions } from './hooks/useNotificationActions';

const NotificationsPage = () => {
  const { t } = useTranslation('notifications');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { items, markAsRead, markAll } = useNotifications();
  
  // State management
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Custom hooks
  const {
    filters,
    sortBy,
    updateFilter,
    updateSort,
    filteredAndSortedNotifications
  } = useNotificationFilters(items);

  const {
    searchQuery,
    setSearchQuery,
    searchResults
  } = useNotificationSearch(filteredAndSortedNotifications);

  const {
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDeleteNotification,
    handleBulkActions
  } = useNotificationActions({
    markAsRead,
    markAll,
    setSnackbar,
    setSelectedNotifications
  });

  // Final processed notifications
  const displayNotifications = searchQuery ? searchResults : filteredAndSortedNotifications;

  // Statistics
  const stats = useMemo(() => ({
    total: items.length,
    unread: items.filter(n => !n.read).length,
    read: items.filter(n => n.read).length,
    today: items.filter(n => {
      const today = new Date();
      const notifDate = new Date(n.createdAt);
      return notifDate.toDateString() === today.toDateString();
    }).length
  }), [items]);

  // Handle notification selection
  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === displayNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(displayNotifications.map(n => n.id));
    }
  };

  // Refresh notifications
  const handleRefresh = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual refresh logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSnackbar({
        open: true,
        message: t('notificationsRefreshed'),
        severity: 'success'
      });
    } catch (err) {
      setError(t('errorRefreshing'));
    } finally {
      setLoading(false);
    }
  };

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    const groups = {};
    displayNotifications.forEach(notification => {
      const date = new Date(notification.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let groupKey;
      if (date.toDateString() === today.toDateString()) {
        groupKey = t('today');
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = t('yesterday');
      } else if (date > new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
        groupKey = t('thisWeek');
      } else if (date > new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)) {
        groupKey = t('thisMonth');
      } else {
        groupKey = t('older');
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(notification);
    });
    
    return groups;
  }, [displayNotifications, t]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      
      <MDBox pt={3} pb={3}>
        {/* Header Section */}
        <Box sx={{ mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                {t('notifications')}
              </Typography>
              <Box display="flex" gap={2} flexWrap="wrap">
                <Chip 
                  label={`${stats.total} ${t('total')}`}
                  variant="outlined"
                  size="small"
                />
                <Chip 
                  label={`${stats.unread} ${t('unread')}`}
                  color="primary"
                  size="small"
                />
                <Chip 
                  label={`${stats.today} ${t('today')}`}
                  color="secondary"
                  size="small"
                />
              </Box>
            </Box>
            
            <Box display="flex" gap={1}>
              <Tooltip title={t('refresh')}>
                <IconButton onClick={handleRefresh} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('notificationSettings')}>
                <IconButton onClick={() => setSettingsOpen(true)}>
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Search and Filters */}
          <Box display="flex" gap={2} mb={2} flexWrap="wrap">
            <TextField
              placeholder={t('searchNotifications')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                      <CloseIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ flexGrow: 1, minWidth: 250 }}
              size="small"
            />
            
            <NotificationFilters
              filters={filters}
              sortBy={sortBy}
              onFilterChange={updateFilter}
              onSortChange={updateSort}
            />
          </Box>

          {/* Bulk Actions */}
          {selectedNotifications.length > 0 && (
            <BulkActions
              selectedCount={selectedNotifications.length}
              totalCount={displayNotifications.length}
              onSelectAll={handleSelectAll}
              onMarkAllRead={() => handleBulkActions('markRead', selectedNotifications)}
              onDeleteAll={() => handleBulkActions('delete', selectedNotifications)}
              onClearSelection={() => setSelectedNotifications([])}
            />
          )}
        </Box>

        {/* Error State */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={() => setError(null)}>
                {t('dismiss')}
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Box sx={{ mb: 2 }}>
            {[...Array(3)].map((_, index) => (
              <Card key={index} sx={{ mb: 1 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Box flexGrow={1}>
                      <Skeleton variant="text" width="60%" />
                      <Skeleton variant="text" width="80%" />
                      <Skeleton variant="text" width="40%" />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* Notifications List */}
        {!loading && displayNotifications.length > 0 ? (
          <Box>
            {Object.entries(groupedNotifications).map(([groupName, notifications]) => (
              <Box key={groupName} sx={{ mb: 3 }}>
                <Typography 
                  variant="h6" 
                  color="text.secondary" 
                  sx={{ mb: 2, fontWeight: 600 }}
                >
                  {groupName}
                </Typography>
                
                <AnimatePresence>
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <NotificationCard
                        notification={notification}
                        selected={selectedNotifications.includes(notification.id)}
                        onSelect={() => handleSelectNotification(notification.id)}
                        onMarkAsRead={() => handleMarkAsRead(notification.id)}
                        onDelete={() => handleDeleteNotification(notification.id)}
                        showSelection={selectedNotifications.length > 0}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </Box>
            ))}
          </Box>
        ) : !loading && (
          <EmptyState 
            hasSearch={!!searchQuery}
            onClearSearch={() => setSearchQuery('')}
            onRefresh={handleRefresh}
          />
        )}

        {/* Quick Action FAB */}
        {stats.unread > 0 && !isMobile && (
          <Tooltip title={t('markAllRead')}>
            <Fab
              color="primary"
              sx={{
                position: 'fixed',
                bottom: 80,
                right: 24,
                zIndex: 1000
              }}
              onClick={handleMarkAllAsRead}
            >
              <Badge badgeContent={stats.unread} color="error">
                <MarkReadIcon />
              </Badge>
            </Fab>
          </Tooltip>
        )}
      </MDBox>

      {/* Settings Dialog */}
      <NotificationSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Footer />
    </DashboardLayout>
  );
};

export default NotificationsPage;