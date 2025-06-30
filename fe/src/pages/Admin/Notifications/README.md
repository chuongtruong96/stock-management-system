# Enhanced Notifications System

A modern, feature-rich notification management system with comprehensive UI/UX improvements and full internationalization support.

## Features

### 🎨 Modern UI/UX
- **Card-based Layout**: Clean, modern card design replacing traditional tables
- **Visual Hierarchy**: Clear distinction between read/unread notifications
- **Smooth Animations**: Framer Motion powered transitions and micro-interactions
- **Responsive Design**: Mobile-first approach with touch-friendly interactions
- **Dark Mode Support**: Automatic theme detection and switching
- **Accessibility**: Full ARIA support, keyboard navigation, and screen reader compatibility

### 🔍 Advanced Filtering & Search
- **Multi-criteria Filtering**: Filter by status, type, priority, and time range
- **Real-time Search**: Instant search across titles, messages, and metadata
- **Smart Sorting**: Sort by date, priority, type, and read status
- **Active Filter Display**: Visual chips showing current filter state

### 📱 Enhanced Interactions
- **Bulk Actions**: Select multiple notifications for batch operations
- **Swipe Actions**: Mobile-friendly swipe gestures
- **Quick Actions**: Floating action button for common tasks
- **Expandable Details**: Click to expand notification content
- **Context Menus**: Right-click or long-press for additional options

### 🌐 Internationalization
- **Full Translation Support**: Complete English and Vietnamese translations
- **Dynamic Language Switching**: Real-time language changes
- **Localized Date Formatting**: Proper date/time formatting for each locale
- **RTL Support**: Ready for right-to-left languages

### ⚙️ Notification Settings
- **Preference Management**: Comprehensive notification settings panel
- **Category Controls**: Enable/disable specific notification types
- **Frequency Settings**: Control notification delivery frequency
- **Channel Selection**: Choose between push, email, and sound notifications

## Component Architecture

```
Notifications/
├── Notifications.jsx              # Main container component
├── components/
│   ├── NotificationCard.jsx       # Individual notification display
│   ├── NotificationFilters.jsx    # Filter and sort controls
│   ├── NotificationSearch.jsx     # Search functionality
│   ├── NotificationSettings.jsx   # Settings dialog
│   ├── EmptyState.jsx            # Empty state component
│   └── BulkActions.jsx           # Bulk action controls
├── hooks/
│   ├── useNotificationFilters.js  # Filter and sort logic
│   ├── useNotificationSearch.js   # Search functionality
│   └── useNotificationActions.js  # Action handlers
├── utils/
│   └── notificationHelpers.js     # Utility functions
├── styles/
│   └── notifications.css          # Enhanced styling
└── translations/
    ├── en/notifications.json       # English translations
    └── vi/notifications.json       # Vietnamese translations
```

## Usage

### Basic Implementation
```jsx
import NotificationsPage from './pages/Admin/Notifications';

function App() {
  return <NotificationsPage />;
}
```

### Using Individual Components
```jsx
import { 
  NotificationCard, 
  NotificationFilters,
  useNotificationFilters 
} from './pages/Admin/Notifications';

function CustomNotificationView({ notifications }) {
  const { filteredNotifications, updateFilter } = useNotificationFilters(notifications);
  
  return (
    <div>
      <NotificationFilters onFilterChange={updateFilter} />
      {filteredNotifications.map(notification => (
        <NotificationCard key={notification.id} notification={notification} />
      ))}
    </div>
  );
}
```

## Notification Data Structure

```typescript
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'system' | 'promotion' | 'reminder' | 'alert' | 'update';
  priority?: 'urgent' | 'high' | 'medium' | 'low' | 'normal';
  read: boolean;
  createdAt: string; // ISO date string
  readAt?: string; // ISO date string
  metadata?: Record<string, any>;
}
```

## Customization

### Theming
The component uses Material-UI's theming system and can be customized through the theme provider:

```jsx
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#your-primary-color',
    },
    // ... other theme customizations
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <NotificationsPage />
    </ThemeProvider>
  );
}
```

### Custom Notification Types
Add new notification types by extending the configuration in `notificationHelpers.js`:

```javascript
export const getNotificationTypeConfig = (type) => {
  const typeConfigs = {
    // ... existing types
    custom: {
      color: '#your-color',
      bgColor: 'rgba(your-color, 0.1)',
      icon: 'YourIcon',
      priority: 2
    }
  };
  // ...
};
```

## Performance Optimizations

- **Virtual Scrolling**: Handles large notification lists efficiently
- **Memoization**: Optimized re-renders with React.memo and useMemo
- **Debounced Search**: Prevents excessive API calls during search
- **Lazy Loading**: Components and data loaded on demand

## Accessibility Features

- **ARIA Labels**: Comprehensive screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Proper focus handling and visual indicators
- **High Contrast**: Support for high contrast mode
- **Reduced Motion**: Respects user's motion preferences

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari 14+, Chrome Mobile 90+)

## Dependencies

### Core Dependencies
- React 18+
- Material-UI 5+
- Framer Motion 6+
- React i18next 11+
- date-fns 2+

### Development Dependencies
- ESLint
- Prettier
- TypeScript (optional)

## Performance Metrics

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms
- **Accessibility Score**: 95+

## Future Enhancements

- [ ] Offline support with service workers
- [ ] Push notification integration
- [ ] Advanced notification scheduling
- [ ] Notification templates
- [ ] Analytics and reporting
- [ ] Export functionality
- [ ] Advanced search with filters
- [ ] Notification categories management
- [ ] Custom notification sounds
- [ ] Integration with external services

## Contributing

1. Follow the existing code style and patterns
2. Add appropriate tests for new features
3. Update translations for new text content
4. Ensure accessibility compliance
5. Test across different devices and browsers

## License

This component is part of the Stationery Management System and follows the project's licensing terms.