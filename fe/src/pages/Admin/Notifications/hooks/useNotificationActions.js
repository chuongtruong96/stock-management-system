import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export const useNotificationActions = ({
  markAsRead,
  markAll,
  setSnackbar,
  setSelectedNotifications
}) => {
  const { t } = useTranslation('notifications');

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  }, [setSnackbar]);

  const handleMarkAsRead = useCallback(async (notificationId) => {
    try {
      await markAsRead(notificationId);
      showSnackbar(t('markedAsRead'));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      showSnackbar(t('errorMarkingAsRead'), 'error');
    }
  }, [markAsRead, showSnackbar, t]);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAll();
      showSnackbar(t('allMarkedAsRead'));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      showSnackbar(t('errorMarkingAllAsRead'), 'error');
    }
  }, [markAll, showSnackbar, t]);

  const handleDeleteNotification = useCallback(async (notificationId) => {
    // Show confirmation dialog
    if (window.confirm(t('confirmDelete'))) {
      try {
        // TODO: Implement delete notification API call
        // await deleteNotification(notificationId);
        showSnackbar(t('notificationDeleted'));
      } catch (error) {
        console.error('Error deleting notification:', error);
        showSnackbar(t('errorDeletingNotification'), 'error');
      }
    }
  }, [showSnackbar, t]);

  const handleBulkActions = useCallback(async (action, selectedIds) => {
    try {
      switch (action) {
        case 'markRead':
          // Mark selected notifications as read
          for (const id of selectedIds) {
            await markAsRead(id);
          }
          showSnackbar(t('selectedMarkedAsRead', { count: selectedIds.length }));
          break;
          
        case 'delete':
          // Show confirmation dialog
          if (window.confirm(t('confirmDeleteSelected', { count: selectedIds.length }))) {
            // TODO: Implement bulk delete API call
            // await bulkDeleteNotifications(selectedIds);
            showSnackbar(t('selectedDeleted', { count: selectedIds.length }));
          }
          break;
          
        default:
          console.warn('Unknown bulk action:', action);
      }
      
      // Clear selection after action
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Error performing bulk action:', error);
      showSnackbar(t('errorPerformingBulkAction'), 'error');
    }
  }, [markAsRead, showSnackbar, setSelectedNotifications, t]);

  return {
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDeleteNotification,
    handleBulkActions
  };
};