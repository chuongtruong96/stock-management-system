import { useState, useMemo } from 'react';

export const useNotificationFilters = (notifications) => {
  const [filters, setFilters] = useState({
    status: 'all', // all, read, unread
    type: 'all', // all, order, system, promotion, reminder, alert, update
    priority: 'all', // all, urgent, high, medium, low, normal
    timeRange: 'all' // all, today, yesterday, thisWeek, lastWeek, thisMonth, lastMonth
  });

  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, priority, type, read

  const updateFilter = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const updateSort = (sortType) => {
    setSortBy(sortType);
  };

  const filteredAndSortedNotifications = useMemo(() => {
    let filtered = [...notifications];

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(notification => {
        if (filters.status === 'read') return notification.read;
        if (filters.status === 'unread') return !notification.read;
        return true;
      });
    }

    // Apply type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(notification => notification.type === filters.type);
    }

    // Apply priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter(notification => 
        notification.priority === filters.priority || 
        (!notification.priority && filters.priority === 'normal')
      );
    }

    // Apply time range filter
    if (filters.timeRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const thisWeekStart = new Date(today);
      thisWeekStart.setDate(today.getDate() - today.getDay());
      const lastWeekStart = new Date(thisWeekStart);
      lastWeekStart.setDate(thisWeekStart.getDate() - 7);
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      filtered = filtered.filter(notification => {
        const notifDate = new Date(notification.createdAt);
        
        switch (filters.timeRange) {
          case 'today':
            return notifDate >= today;
          case 'yesterday':
            return notifDate >= yesterday && notifDate < today;
          case 'thisWeek':
            return notifDate >= thisWeekStart;
          case 'lastWeek':
            return notifDate >= lastWeekStart && notifDate < thisWeekStart;
          case 'thisMonth':
            return notifDate >= thisMonthStart;
          case 'lastMonth':
            return notifDate >= lastMonthStart && notifDate <= lastMonthEnd;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1, normal: 0 };
          const aPriority = priorityOrder[a.priority] || 0;
          const bPriority = priorityOrder[b.priority] || 0;
          if (aPriority !== bPriority) {
            return bPriority - aPriority;
          }
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'type':
          if (a.type !== b.type) {
            return a.type.localeCompare(b.type);
          }
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'read':
          if (a.read !== b.read) {
            return a.read ? 1 : -1; // Unread first
          }
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return filtered;
  }, [notifications, filters, sortBy]);

  return {
    filters,
    sortBy,
    updateFilter,
    updateSort,
    filteredAndSortedNotifications
  };
};