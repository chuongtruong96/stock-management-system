import { useState, useMemo } from 'react';

export const useNotificationSearch = (notifications) => {
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return notifications;
    }

    const query = searchQuery.toLowerCase().trim();
    
    return notifications.filter(notification => {
      // Search in title
      if (notification.title?.toLowerCase().includes(query)) {
        return true;
      }

      // Search in message
      if (notification.message?.toLowerCase().includes(query)) {
        return true;
      }

      // Search in type
      if (notification.type?.toLowerCase().includes(query)) {
        return true;
      }

      // Search in priority
      if (notification.priority?.toLowerCase().includes(query)) {
        return true;
      }

      // Search in metadata if available
      if (notification.metadata) {
        const metadataString = JSON.stringify(notification.metadata).toLowerCase();
        if (metadataString.includes(query)) {
          return true;
        }
      }

      return false;
    });
  }, [notifications, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults
  };
};