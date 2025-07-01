import React from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  Fade,
  Zoom,
  Slide,
  keyframes,
  useTheme,
} from '@mui/material';
import {
  SearchOff as NoResultsIcon,
  Inventory as ProductsIcon,
  FilterList as FilterIcon,
  ShoppingCart as CartIcon,
  Favorite as FavoriteIcon,
  History as HistoryIcon,
  TrendingUp as TrendingIcon,
  Lightbulb as IdeaIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
} from '@mui/icons-material';

// Animation keyframes
const float = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
`;

const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0,0,0);
  }
  40%, 43% {
    transform: translate3d(0, -8px, 0);
  }
  70% {
    transform: translate3d(0, -4px, 0);
  }
  90% {
    transform: translate3d(0, -2px, 0);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const iconMap = {
  'no-results': NoResultsIcon,
  'no-products': ProductsIcon,
  'no-filters': FilterIcon,
  'empty-cart': CartIcon,
  'no-favorites': FavoriteIcon,
  'no-history': HistoryIcon,
  'trending': TrendingIcon,
  'idea': IdeaIcon,
  'default': ProductsIcon,
};

const presetMessages = {
  'no-results': {
    title: 'No results found',
    description: 'We couldn\'t find any products matching your search criteria. Try adjusting your filters or search terms.',
    suggestions: ['Clear all filters', 'Try different keywords', 'Browse categories'],
  },
  'no-products': {
    title: 'No products available',
    description: 'There are currently no products in this category. Check back later for new arrivals.',
    suggestions: ['Browse other categories', 'View featured products', 'Subscribe for updates'],
  },
  'empty-cart': {
    title: 'Your cart is empty',
    description: 'Looks like you haven\'t added any products to your cart yet. Start shopping to fill it up!',
    suggestions: ['Browse products', 'View recommendations', 'Check out deals'],
  },
  'no-favorites': {
    title: 'No favorites yet',
    description: 'You haven\'t saved any products to your favorites. Start exploring and save items you love!',
    suggestions: ['Browse products', 'Explore categories', 'View trending items'],
  },
  'no-history': {
    title: 'No order history',
    description: 'You haven\'t placed any orders yet. Start shopping to see your order history here.',
    suggestions: ['Start shopping', 'Browse categories', 'View deals'],
  },
};

export default function EnhancedEmptyState({
  variant = 'default',
  icon: CustomIcon,
  title,
  description,
  suggestions = [],
  actions = [],
  animation = 'float',
  size = 'medium',
  showBackground = true,
  compact = false,
  illustration,
  onActionClick,
  children,
}) {
  const theme = useTheme();
  
  const preset = presetMessages[variant] || {};
  const finalTitle = title || preset.title || 'No items found';
  const finalDescription = description || preset.description || 'There are no items to display at the moment.';
  const finalSuggestions = suggestions.length > 0 ? suggestions : (preset.suggestions || []);
  
  const IconComponent = CustomIcon || iconMap[variant] || iconMap.default;
  
  const sizeMap = {
    small: { icon: 48, container: 200 },
    medium: { icon: 80, container: 300 },
    large: { icon: 120, container: 400 },
  };
  
  const sizes = sizeMap[size] || sizeMap.medium;
  
  const getAnimation = () => {
    switch (animation) {
      case 'bounce':
        return bounce;
      case 'pulse':
        return pulse;
      case 'float':
      default:
        return float;
    }
  };

  const defaultActions = [
    {
      label: 'Refresh',
      icon: RefreshIcon,
      variant: 'outlined',
      onClick: () => window.location.reload(),
    },
    {
      label: 'Go Back',
      variant: 'text',
      onClick: () => window.history.back(),
    },
  ];

  const finalActions = actions.length > 0 ? actions : defaultActions;

  return (
    <Fade in timeout={500}>
      <Paper
        elevation={showBackground ? 1 : 0}
        sx={{
          p: compact ? 3 : 6,
          textAlign: 'center',
          borderRadius: 3,
          border: showBackground ? '1px solid' : 'none',
          borderColor: 'divider',
          background: showBackground 
            ? 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,249,250,0.9) 100%)'
            : 'transparent',
          backdropFilter: showBackground ? 'blur(10px)' : 'none',
          maxWidth: sizes.container,
          mx: 'auto',
        }}
      >
        <Stack spacing={compact ? 2 : 3} alignItems="center">
          {/* Icon/Illustration */}
          <Zoom in timeout={600}>
            <Box
              sx={{
                width: sizes.icon + 32,
                height: sizes.icon + 32,
                borderRadius: '50%',
                bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: `${getAnimation()} 3s ease-in-out infinite`,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
                  borderRadius: '50%',
                  opacity: 0.5,
                },
              }}
            >
              {illustration ? (
                <Box component="img" src={illustration} alt="Empty state" sx={{ width: sizes.icon, height: sizes.icon }} />
              ) : (
                <IconComponent 
                  sx={{ 
                    fontSize: sizes.icon, 
                    color: 'text.secondary',
                    zIndex: 1,
                  }} 
                />
              )}
            </Box>
          </Zoom>

          {/* Content */}
          <Slide in timeout={800} direction="up">
            <Stack spacing={compact ? 1 : 2} alignItems="center">
              <Typography 
                variant={compact ? "h6" : "h5"} 
                fontWeight={600} 
                color="text.primary"
                sx={{
                  maxWidth: 400,
                  lineHeight: 1.3,
                }}
              >
                {finalTitle}
              </Typography>
              
              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ 
                  maxWidth: 500, 
                  mx: 'auto',
                  lineHeight: 1.5,
                  fontSize: compact ? '0.9rem' : '1rem',
                }}
              >
                {finalDescription}
              </Typography>
            </Stack>
          </Slide>

          {/* Suggestions */}
          {finalSuggestions.length > 0 && (
            <Fade in timeout={1000}>
              <Box sx={{ mt: compact ? 2 : 3 }}>
                <Typography 
                  variant="subtitle2" 
                  color="text.secondary" 
                  gutterBottom
                  sx={{ mb: 1.5 }}
                >
                  Try these suggestions:
                </Typography>
                <Stack spacing={1}>
                  {finalSuggestions.map((suggestion, index) => (
                    <Zoom in timeout={1200 + (index * 100)} key={index}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1,
                          py: 0.5,
                          px: 2,
                          borderRadius: 2,
                          bgcolor: 'action.hover',
                          color: 'text.secondary',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            bgcolor: 'primary.light',
                            color: 'primary.main',
                            transform: 'translateY(-1px)',
                          },
                        }}
                        onClick={() => onActionClick?.(suggestion, index)}
                      >
                        <IdeaIcon sx={{ fontSize: 16 }} />
                        {suggestion}
                      </Box>
                    </Zoom>
                  ))}
                </Stack>
              </Box>
            </Fade>
          )}

          {/* Actions */}
          {finalActions.length > 0 && (
            <Slide in timeout={1400} direction="up">
              <Stack 
                direction={compact ? "column" : "row"} 
                spacing={2} 
                sx={{ mt: compact ? 2 : 3 }}
              >
                {finalActions.map((action, index) => {
                  const ActionIcon = action.icon;
                  return (
                    <Button
                      key={index}
                      variant={action.variant || 'contained'}
                      color={action.color || 'primary'}
                      size={compact ? 'small' : 'medium'}
                      startIcon={ActionIcon && <ActionIcon />}
                      onClick={action.onClick}
                      disabled={action.disabled}
                      sx={{
                        borderRadius: 3,
                        px: 3,
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 600,
                        minWidth: compact ? 120 : 140,
                        boxShadow: action.variant === 'contained' 
                          ? '0 4px 12px rgba(25, 118, 210, 0.3)' 
                          : 'none',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: action.variant === 'contained' 
                            ? '0 6px 16px rgba(25, 118, 210, 0.4)' 
                            : '0 2px 8px rgba(0,0,0,0.1)',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      {action.label}
                    </Button>
                  );
                })}
              </Stack>
            </Slide>
          )}

          {/* Custom children */}
          {children && (
            <Fade in timeout={1600}>
              <Box sx={{ mt: compact ? 2 : 3 }}>
                {children}
              </Box>
            </Fade>
          )}
        </Stack>
      </Paper>
    </Fade>
  );
}

// Preset empty state components
export const NoResultsFound = (props) => (
  <EnhancedEmptyState variant="no-results" {...props} />
);

export const NoProductsAvailable = (props) => (
  <EnhancedEmptyState variant="no-products" {...props} />
);

export const EmptyCart = (props) => (
  <EnhancedEmptyState variant="empty-cart" {...props} />
);

export const NoFavorites = (props) => (
  <EnhancedEmptyState variant="no-favorites" {...props} />
);

export const NoOrderHistory = (props) => (
  <EnhancedEmptyState variant="no-history" {...props} />
);