import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Stack
} from '@mui/material';
import {
  ErrorOutline as ErrorIcon,
  Refresh as RefreshIcon,
  BugReport as BugIcon
} from '@mui/icons-material';

class ReportsErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console for debugging
    console.error('Reports Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
              
              <Typography variant="h5" fontWeight="bold" color="error.main" gutterBottom>
                Something went wrong
              </Typography>
              
              <Typography variant="body1" color="textSecondary" mb={3}>
                An unexpected error occurred while loading the reports page. 
                Please try refreshing or contact support if the problem persists.
              </Typography>

              <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Error Details:
                </Typography>
                <Typography variant="body2" component="pre" sx={{ fontSize: '0.8rem', overflow: 'auto' }}>
                  {this.state.error && this.state.error.toString()}
                </Typography>
              </Alert>

              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={this.handleRetry}
                  sx={{ borderRadius: 2 }}
                >
                  Try Again
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<BugIcon />}
                  onClick={() => {
                    // Could integrate with error reporting service
                    console.log('Report bug clicked', this.state.error);
                  }}
                  sx={{ borderRadius: 2 }}
                >
                  Report Issue
                </Button>
              </Stack>

              {process.env.NODE_ENV === 'development' && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 2, textAlign: 'left' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Development Info:
                  </Typography>
                  <Typography variant="body2" component="pre" sx={{ fontSize: '0.7rem', overflow: 'auto' }}>
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ReportsErrorBoundary;