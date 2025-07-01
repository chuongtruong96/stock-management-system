import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Fade,
  Zoom,
  Skeleton,
  Stack,
  Paper,
  keyframes,
} from '@mui/material';
import {
  Inventory as ProductsIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ShoppingCart as CartIcon,
} from '@mui/icons-material';

// Custom keyframe animations
const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
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

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

// Enhanced Loading Spinner with different variants
export default function EnhancedLoadingSpinner({
  variant = 'default',
  size = 'medium',
  message = 'Loading...',
  submessage,
  color = 'primary',
  fullScreen = false,
  overlay = false,
  icon: CustomIcon,
  animation = 'pulse',
  showProgress = false,
  progress = 0,
  children,
}) {
  const sizeMap = {
    small: 24,
    medium: 40,
    large: 60,
    xlarge: 80,
  };

  const actualSize = sizeMap[size] || sizeMap.medium;

  const getAnimation = () => {
    switch (animation) {
      case 'bounce':
        return bounce;
      case 'float':
        return float;
      case 'pulse':
      default:
        return pulse;
    }
  };

  const LoadingContent = () => {
    switch (variant) {
      case 'skeleton':
        return <SkeletonLoader />;
      case 'dots':
        return <DotsLoader size={actualSize} color={color} />;
      case 'bars':
        return <BarsLoader size={actualSize} color={color} />;
      case 'spinner':
        return <SpinnerLoader size={actualSize} color={color} message={message} submessage={submessage} />;
      case 'icon':
        return (
          <IconLoader 
            Icon={CustomIcon || ProductsIcon} 
            size={actualSize} 
            color={color} 
            animation={getAnimation()}
            message={message}
            submessage={submessage}
          />
        );
      case 'progress':
        return (
          <ProgressLoader 
            size={actualSize} 
            color={color} 
            message={message} 
            submessage={submessage}
            progress={progress}
            showProgress={showProgress}
          />
        );
      default:
        return <DefaultLoader size={actualSize} color={color} message={message} submessage={submessage} />;
    }
  };

  const containerSx = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    ...(fullScreen && {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(8px)',
      zIndex: 9999,
    }),
    ...(overlay && {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(4px)',
      zIndex: 1000,
    }),
  };

  return (
    <Fade in timeout={300}>
      <Box sx={containerSx}>
        <LoadingContent />
        {children}
      </Box>
    </Fade>
  );
}

// Default circular progress loader
const DefaultLoader = ({ size, color, message, submessage }) => (
  <Stack alignItems="center" spacing={2}>
    <Box sx={{ position: 'relative' }}>
      <CircularProgress
        size={size}
        color={color}
        sx={{
          animation: `${pulse} 2s ease-in-out infinite`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <ProductsIcon 
          sx={{ 
            fontSize: size * 0.4, 
            color: `${color}.main`,
            animation: `${float} 3s ease-in-out infinite`,
          }} 
        />
      </Box>
    </Box>
    {message && (
      <Typography variant="body1" color="text.secondary" fontWeight={500}>
        {message}
      </Typography>
    )}
    {submessage && (
      <Typography variant="caption" color="text.secondary">
        {submessage}
      </Typography>
    )}
  </Stack>
);

// Icon-based loader
const IconLoader = ({ Icon, size, color, animation, message, submessage }) => (
  <Stack alignItems="center" spacing={2}>
    <Box
      sx={{
        animation: `${animation} 2s ease-in-out infinite`,
        color: `${color}.main`,
      }}
    >
      <Icon sx={{ fontSize: size }} />
    </Box>
    {message && (
      <Typography variant="body1" color="text.secondary" fontWeight={500}>
        {message}
      </Typography>
    )}
    {submessage && (
      <Typography variant="caption" color="text.secondary">
        {submessage}
      </Typography>
    )}
  </Stack>
);

// Progress loader with percentage
const ProgressLoader = ({ size, color, message, submessage, progress, showProgress }) => (
  <Stack alignItems="center" spacing={2}>
    <Box sx={{ position: 'relative' }}>
      <CircularProgress
        variant="determinate"
        value={progress}
        size={size}
        color={color}
        sx={{
          animation: `${pulse} 2s ease-in-out infinite`,
        }}
      />
      {showProgress && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <Typography variant="caption" fontWeight={600} color={`${color}.main`}>
            {Math.round(progress)}%
          </Typography>
        </Box>
      )}
    </Box>
    {message && (
      <Typography variant="body1" color="text.secondary" fontWeight={500}>
        {message}
      </Typography>
    )}
    {submessage && (
      <Typography variant="caption" color="text.secondary">
        {submessage}
      </Typography>
    )}
  </Stack>
);

// Animated dots loader
const DotsLoader = ({ size, color }) => {
  const dotSize = size / 8;
  
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      {[0, 1, 2].map((index) => (
        <Box
          key={index}
          sx={{
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            backgroundColor: `${color}.main`,
            animation: `${bounce} 1.4s ease-in-out infinite both`,
            animationDelay: `${index * 0.16}s`,
          }}
        />
      ))}
    </Stack>
  );
};

// Animated bars loader
const BarsLoader = ({ size, color }) => {
  const barWidth = size / 8;
  const barHeights = [size * 0.6, size * 0.8, size, size * 0.8, size * 0.6];
  
  return (
    <Stack direction="row" spacing={0.5} alignItems="end">
      {barHeights.map((height, index) => (
        <Box
          key={index}
          sx={{
            width: barWidth,
            height: height,
            backgroundColor: `${color}.main`,
            borderRadius: 1,
            animation: `${pulse} 1.2s ease-in-out infinite`,
            animationDelay: `${index * 0.1}s`,
          }}
        />
      ))}
    </Stack>
  );
};

// Enhanced spinner with rotating effect
const SpinnerLoader = ({ size, color, message, submessage }) => (
  <Stack alignItems="center" spacing={2}>
    <Box
      sx={{
        width: size,
        height: size,
        border: `${size / 10}px solid`,
        borderColor: `${color}.light`,
        borderTopColor: `${color}.main`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        '@keyframes spin': {
          '0%': {
            transform: 'rotate(0deg)',
          },
          '100%': {
            transform: 'rotate(360deg)',
          },
        },
      }}
    />
    {message && (
      <Typography variant="body1" color="text.secondary" fontWeight={500}>
        {message}
      </Typography>
    )}
    {submessage && (
      <Typography variant="caption" color="text.secondary">
        {submessage}
      </Typography>
    )}
  </Stack>
);

// Skeleton loader for content
const SkeletonLoader = () => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: 3,
      border: '1px solid',
      borderColor: 'divider',
      width: '100%',
      maxWidth: 400,
    }}
  >
    <Stack spacing={2}>
      <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
      <Skeleton variant="text" width="80%" height={24} />
      <Skeleton variant="text" width="60%" height={20} />
      <Stack direction="row" spacing={1}>
        <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 1 }} />
      </Stack>
    </Stack>
  </Paper>
);

// Shimmer effect component
export const ShimmerLoader = ({ width = '100%', height = 20, borderRadius = 1 }) => (
  <Box
    sx={{
      width,
      height,
      borderRadius,
      background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      backgroundSize: '200px 100%',
      animation: `${shimmer} 1.5s infinite`,
    }}
  />
);

// Loading overlay component
export const LoadingOverlay = ({ loading, children, ...props }) => (
  <Box sx={{ position: 'relative' }}>
    {children}
    {loading && (
      <EnhancedLoadingSpinner
        overlay
        variant="spinner"
        size="medium"
        message="Loading..."
        {...props}
      />
    )}
  </Box>
);