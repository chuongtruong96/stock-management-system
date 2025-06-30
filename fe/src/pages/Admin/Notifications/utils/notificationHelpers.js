import { formatDistanceToNow, format, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns';
import { enUS, vi } from 'date-fns/locale';

// Get the appropriate locale based on language
export const getDateLocale = (language) => {
  switch (language) {
    case 'vi':
      return vi;
    default:
      return enUS;
  }
};

// Format notification time with smart relative formatting
export const formatNotificationTime = (date, language = 'en') => {
  const notifDate = new Date(date);
  const now = new Date();
  const locale = getDateLocale(language);
  
  const diffInHours = (now - notifDate) / (1000 * 60 * 60);
  
  // Less than 24 hours - show relative time
  if (diffInHours < 24) {
    return formatDistanceToNow(notifDate, { addSuffix: true, locale });
  }
  
  // Less than 7 days - show day and time
  if (diffInHours < 168) { // 7 days
    return format(notifDate, 'EEE HH:mm', { locale });
  }
  
  // Older - show full date
  return format(notifDate, 'MMM dd, yyyy', { locale });
};

// Get notification type configuration
export const getNotificationTypeConfig = (type) => {
  const typeConfigs = {
    order: {
      color: '#1976d2',
      bgColor: 'rgba(25, 118, 210, 0.1)',
      icon: 'Assignment',
      priority: 2
    },
    system: {
      color: '#0288d1',
      bgColor: 'rgba(2, 136, 209, 0.1)',
      icon: 'SystemUpdate',
      priority: 3
    },
    promotion: {
      color: '#7b1fa2',
      bgColor: 'rgba(123, 31, 162, 0.1)',
      icon: 'LocalOffer',
      priority: 1
    },
    reminder: {
      color: '#f57c00',
      bgColor: 'rgba(245, 124, 0, 0.1)',
      icon: 'Schedule',
      priority: 2
    },
    alert: {
      color: '#d32f2f',
      bgColor: 'rgba(211, 47, 47, 0.1)',
      icon: 'Warning',
      priority: 4
    },
    update: {
      color: '#388e3c',
      bgColor: 'rgba(56, 142, 60, 0.1)',
      icon: 'Announcement',
      priority: 1
    }
  };
  
  return typeConfigs[type] || {
    color: '#757575',
    bgColor: 'rgba(117, 117, 117, 0.1)',
    icon: 'Info',
    priority: 1
  };
};

// Get priority configuration
export const getPriorityConfig = (priority) => {
  const priorityConfigs = {
    urgent: {
      color: '#d32f2f',
      bgColor: 'rgba(211, 47, 47, 0.1)',
      weight: 4,
      label: 'Urgent'
    },
    high: {
      color: '#f57c00',
      bgColor: 'rgba(245, 124, 0, 0.1)',
      weight: 3,
      label: 'High'
    },
    medium: {
      color: '#1976d2',
      bgColor: 'rgba(25, 118, 210, 0.1)',
      weight: 2,
      label: 'Medium'
    },
    low: {
      color: '#388e3c',
      bgColor: 'rgba(56, 142, 60, 0.1)',
      weight: 1,
      label: 'Low'
    },
    normal: {
      color: '#757575',
      bgColor: 'rgba(117, 117, 117, 0.1)',
      weight: 0,
      label: 'Normal'
    }
  };
  
  return priorityConfigs[priority] || priorityConfigs.normal;
};

// Group notifications by date
export const groupNotificationsByDate = (notifications, language = 'en') => {
  const groups = {};
  const locale = getDateLocale(language);
  
  notifications.forEach(notification => {
    const date = new Date(notification.createdAt);
    let groupKey;
    
    if (isToday(date)) {
      groupKey = language === 'vi' ? 'Hôm nay' : 'Today';
    } else if (isYesterday(date)) {
      groupKey = language === 'vi' ? 'Hôm qua' : 'Yesterday';
    } else if (isThisWeek(date)) {
      groupKey = language === 'vi' ? 'Tuần này' : 'This week';
    } else if (isThisMonth(date)) {
      groupKey = language === 'vi' ? 'Tháng này' : 'This month';
    } else {
      groupKey = language === 'vi' ? 'Cũ hơn' : 'Older';
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(notification);
  });
  
  return groups;
};

// Filter notifications based on criteria
export const filterNotifications = (notifications, filters) => {
  return notifications.filter(notification => {
    // Status filter
    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'read' && !notification.read) return false;
      if (filters.status === 'unread' && notification.read) return false;
    }
    
    // Type filter
    if (filters.type && filters.type !== 'all' && notification.type !== filters.type) {
      return false;
    }
    
    // Priority filter
    if (filters.priority && filters.priority !== 'all') {
      const notifPriority = notification.priority || 'normal';
      if (notifPriority !== filters.priority) return false;
    }
    
    // Time range filter
    if (filters.timeRange && filters.timeRange !== 'all') {
      const notifDate = new Date(notification.createdAt);
      const now = new Date();
      
      switch (filters.timeRange) {
        case 'today':
          if (!isToday(notifDate)) return false;
          break;
        case 'yesterday':
          if (!isYesterday(notifDate)) return false;
          break;
        case 'thisWeek':
          if (!isThisWeek(notifDate)) return false;
          break;
        case 'thisMonth':
          if (!isThisMonth(notifDate)) return false;
          break;
        default:
          break;
      }
    }
    
    return true;
  });
};

// Sort notifications
export const sortNotifications = (notifications, sortBy) => {
  const sorted = [...notifications];
  
  sorted.sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'priority':
        const aPriority = getPriorityConfig(a.priority || 'normal').weight;
        const bPriority = getPriorityConfig(b.priority || 'normal').weight;
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
  
  return sorted;
};

// Search notifications
export const searchNotifications = (notifications, query) => {
  if (!query.trim()) return notifications;
  
  const searchTerm = query.toLowerCase().trim();
  
  return notifications.filter(notification => {
    return (
      notification.title?.toLowerCase().includes(searchTerm) ||
      notification.message?.toLowerCase().includes(searchTerm) ||
      notification.type?.toLowerCase().includes(searchTerm) ||
      notification.priority?.toLowerCase().includes(searchTerm) ||
      (notification.metadata && JSON.stringify(notification.metadata).toLowerCase().includes(searchTerm))
    );
  });
};

// Generate notification statistics
export const getNotificationStats = (notifications) => {
  const stats = {
    total: notifications.length,
    unread: 0,
    read: 0,
    today: 0,
    thisWeek: 0,
    byType: {},
    byPriority: {}
  };
  
  const today = new Date();
  
  notifications.forEach(notification => {
    // Read/Unread count
    if (notification.read) {
      stats.read++;
    } else {
      stats.unread++;
    }
    
    // Today count
    const notifDate = new Date(notification.createdAt);
    if (isToday(notifDate)) {
      stats.today++;
    }
    
    // This week count
    if (isThisWeek(notifDate)) {
      stats.thisWeek++;
    }
    
    // By type
    const type = notification.type || 'unknown';
    stats.byType[type] = (stats.byType[type] || 0) + 1;
    
    // By priority
    const priority = notification.priority || 'normal';
    stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1;
  });
  
  return stats;
};

// Validate notification object
export const validateNotification = (notification) => {
  const errors = [];
  
  if (!notification.id) {
    errors.push('Notification must have an ID');
  }
  
  if (!notification.title || notification.title.trim() === '') {
    errors.push('Notification must have a title');
  }
  
  if (!notification.message || notification.message.trim() === '') {
    errors.push('Notification must have a message');
  }
  
  if (!notification.createdAt) {
    errors.push('Notification must have a creation date');
  }
  
  if (notification.type && !['order', 'system', 'promotion', 'reminder', 'alert', 'update'].includes(notification.type)) {
    errors.push('Invalid notification type');
  }
  
  if (notification.priority && !['urgent', 'high', 'medium', 'low', 'normal'].includes(notification.priority)) {
    errors.push('Invalid notification priority');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};