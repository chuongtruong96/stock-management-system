import React from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  AlertTitle,
  Paper,
  Stack,
  Divider,
  Chip,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  ErrorOutline as ErrorIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  BugReport as BugReportIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * Enhanced Error Boundary Component with better UX and error reporting
 * Provides graceful error handling with recovery options
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Report error to monitoring service
    this.reportError(error, errorInfo);
  }

  reportError = (error, errorInfo) => {
    // In a real application, you would send this to your error reporting service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getUserId(),
    };

    // Example: Send to error reporting service
    // errorReportingService.report(errorReport);
    
    console.error('Error Report:', errorReport);
  };

  getUserId = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.id || 'anonymous';
    } catch {
      return 'anonymous';
    }
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      errorId: null,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReload = () => {
    window.location.reload();
  };

  toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails,
    }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          errorId={this.state.errorId}
          showDetails={this.state.showDetails}
          onRetry={this.handleRetry}
          onGoHome={this.handleGoHome}
          onReload={this.handleReload}
          onToggleDetails={this.toggleDetails}
          {...this.props}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Error Fallback Component with enhanced UI
 */
const ErrorFallback = ({
  error,
  errorInfo,
  errorId,
  showDetails,
  onRetry,
  onGoHome,
  onReload,
  onToggleDetails,
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again or contact support if the problem persists.",
  showRetry = true,
  showHome = true,
  showReload = true,
  showDetails: showDetailsEnabled = true,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const errorMessage = error?.message || 'Unknown error';
  const isNetworkError = errorMessage.toLowerCase().includes('network');
  const isChunkError = errorMessage.toLowerCase().includes('chunk');

  return (
    <Box
      sx={{
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        bgcolor: 'background.default',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          maxWidth: 600,
          width: '100%',
          p: 4,
          textAlign: 'center',
          borderRadius: 3,
        }}
      >
        <Stack spacing={3} alignItems="center">
          {/* Error Icon */}
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'error.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <ErrorIcon sx={{ fontSize: 40, color: 'error.main' }} />
          </Box>

          {/* Error Title */}
          <Typography variant="h4" fontWeight={600} color="text.primary">
            {title}
          </Typography>

          {/* Error Description */}
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {description}
          </Typography>

          {/* Error Type Chip */}
          <Chip
            icon={<BugReportIcon />}
            label={
              isNetworkError
                ? 'Network Error'
                : isChunkError
                ? 'Loading Error'
                : 'Application Error'
            }
            color={isNetworkError ? 'warning' : 'error'}
            variant="outlined"
          />

          {/* Error ID */}
          {errorId && (
            <Typography variant="caption" color="text.secondary">
              Error ID: {errorId}
            </Typography>
          )}

          <Divider sx={{ width: '100%' }} />

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center">
            {showRetry && (
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={onRetry}
                sx={{
                  minWidth: 120,
                  borderRadius: 2,
                }}
              >
                {t('common.retry', 'Try Again')}
              </Button>
            )}

            {showReload && (
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={onReload}
                sx={{
                  minWidth: 120,
                  borderRadius: 2,
                }}
              >
                {t('common.reload', 'Reload Page')}
              </Button>
            )}

            {showHome && (
              <Button
                variant="outlined"
                startIcon={<HomeIcon />}
                onClick={onGoHome}
                sx={{
                  minWidth: 120,
                  borderRadius: 2,
                }}
              >
                {t('common.goHome', 'Go Home')}
              </Button>
            )}
          </Stack>

          {/* Error Details Toggle */}
          {showDetailsEnabled && error && (
            <>
              <Button
                variant="text"
                endIcon={showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                onClick={onToggleDetails}
                sx={{ mt: 2 }}
              >
                {showDetails ? 'Hide Details' : 'Show Details'}
              </Button>

              <Collapse in={showDetails} sx={{ width: '100%' }}>
                <Alert severity="error" sx={{ textAlign: 'left', mt: 2 }}>
                  <AlertTitle>Error Details</AlertTitle>
                  <Typography variant="body2" component="pre" sx={{ 
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                  }}>
                    {errorMessage}
                  </Typography>
                  
                  {error.stack && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Stack Trace:
                      </Typography>
                      <Typography variant="body2" component="pre" sx={{ 
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        fontSize: '0.7rem',
                        fontFamily: 'monospace',
                        maxHeight: 200,
                        overflow: 'auto',
                        bgcolor: 'grey.100',
                        p: 1,
                        borderRadius: 1,
                      }}>
                        {error.stack}
                      </Typography>
                    </Box>
                  )}
                </Alert>
              </Collapse>
            </>
          )}

          {/* Help Text */}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            If this problem continues, please contact support with the error ID above.
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
};

/**
 * Hook for using error boundary programmatically
 */
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error) => {
    console.error('Captured error:', error);
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError };
};

/**
 * HOC for wrapping components with error boundary
 */
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default ErrorBoundary;
export { ErrorFallback };