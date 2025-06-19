import { Box, CircularProgress, Typography, Stack } from "@mui/material";
import { keyframes } from "@mui/system";

// Custom pulse animation
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

// Floating animation
const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

/**
 * Enhanced Loading Spinner Component
 */
function LoadingSpinner({ 
  message = "Loading...", 
  size = 40, 
  fullScreen = false,
  variant = "default" // default, minimal, dots
}) {
  
  const renderSpinner = () => {
    switch (variant) {
      case "minimal":
        return (
          <CircularProgress 
            size={size} 
            thickness={4}
            sx={{
              color: 'primary.main',
              animation: `${pulse} 2s ease-in-out infinite`,
            }}
          />
        );
      
      case "dots":
        return (
          <Stack direction="row" spacing={1} alignItems="center">
            {[0, 1, 2].map((index) => (
              <Box
                key={index}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  animation: `${float} 1.5s ease-in-out infinite`,
                  animationDelay: `${index * 0.2}s`,
                }}
              />
            ))}
          </Stack>
        );
      
      default:
        return (
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress
              size={size}
              thickness={4}
              sx={{
                color: 'primary.main',
                animation: `${pulse} 2s ease-in-out infinite`,
              }}
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography
                variant="caption"
                component="div"
                color="primary.main"
                fontWeight={600}
                sx={{ fontSize: '0.6rem' }}
              >
                📋
              </Typography>
            </Box>
          </Box>
        );
    }
  };

  const content = (
    <Stack
      direction="column"
      alignItems="center"
      justifyContent="center"
      spacing={2}
      sx={{
        p: 3,
        ...(fullScreen && {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          zIndex: 9999,
        }),
      }}
    >
      {renderSpinner()}
      
      {message && (
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          sx={{
            animation: `${pulse} 2s ease-in-out infinite`,
            animationDelay: '0.5s',
          }}
        >
          {message}
        </Typography>
      )}
    </Stack>
  );

  if (fullScreen) {
    return content;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 200,
        width: '100%',
      }}
    >
      {content}
    </Box>
  );
}

export default LoadingSpinner;