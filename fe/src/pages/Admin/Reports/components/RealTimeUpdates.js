import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  LinearProgress,
  Alert,
  Snackbar,
  Badge,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Update as UpdateIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const RealTimeUpdates = ({ 
  onDataUpdate, 
  onRefresh, 
  loading = false,
  lastUpdated = null,
  dataCount = 0,
  hasChanges = false 
}) => {
  const { t } = useTranslation();
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [isConnected, setIsConnected] = useState(true);
  const [updateCount, setUpdateCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(0);
  
  const intervalRef = useRef(null);
  const countdownRef = useRef(null);

  // Simulate connection status (in real app, this would monitor actual connection)
  useEffect(() => {
    const checkConnection = () => {
      // Simulate occasional connection issues
      const connected = Math.random() > 0.05; // 95% uptime
      setIsConnected(connected);
    };

    const connectionInterval = setInterval(checkConnection, 5000);
    return () => clearInterval(connectionInterval);
  }, []);

  // Real-time update logic
  const performUpdate = useCallback(async () => {
    if (!isConnected) return;

    try {
      setUpdateCount(prev => prev + 1);
      
      if (onRefresh) {
        await onRefresh();
      }

      // Simulate data changes detection
      const hasNewData = Math.random() > 0.7; // 30% chance of new data
      if (hasNewData && onDataUpdate) {
        onDataUpdate();
        setNotificationMessage(t('newDataAvailable') || 'New data available');
        setShowNotification(true);
      }
    } catch (error) {
      console.error('Real-time update failed:', error);
      setIsConnected(false);
    }
  }, [isConnected, onRefresh, onDataUpdate, t]);

  // Setup auto-refresh interval
  useEffect(() => {
    if (isRealTimeEnabled && isConnected && refreshInterval > 0) {
      intervalRef.current = setInterval(performUpdate, refreshInterval * 1000);
      
      // Setup countdown
      setTimeUntilRefresh(refreshInterval);
      countdownRef.current = setInterval(() => {
        setTimeUntilRefresh(prev => {
          if (prev <= 1) {
            return refreshInterval;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
        }
      };
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
      setTimeUntilRefresh(0);
    }
  }, [isRealTimeEnabled, isConnected, refreshInterval, performUpdate]);

  const handleRealTimeToggle = (event) => {
    setIsRealTimeEnabled(event.target.checked);
    if (event.target.checked) {
      setUpdateCount(0);
      performUpdate(); // Immediate update when enabled
    }
  };

  const handleManualRefresh = () => {
    setUpdateCount(prev => prev + 1);
    setTimeUntilRefresh(refreshInterval); // Reset countdown
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleIntervalChange = (event) => {
    setRefreshInterval(event.target.value);
    setTimeUntilRefresh(event.target.value);
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return t('never') || 'Never';
    
    const now = new Date();
    const updated = new Date(lastUpdated);
    const diffMs = now - updated;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);

    if (diffSecs < 60) {
      return t('justNow') || 'Just now';
    } else if (diffMins < 60) {
      return t('minutesAgo', { count: diffMins }) || `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return t('hoursAgo', { count: diffHours }) || `${diffHours}h ago`;
    } else {
      return updated.toLocaleDateString();
    }
  };

  const getConnectionStatus = () => {
    if (!isConnected) {
      return {
        icon: WifiOffIcon,
        color: 'error',
        text: t('disconnected') || 'Disconnected'
      };
    } else if (isRealTimeEnabled) {
      return {
        icon: WifiIcon,
        color: 'success',
        text: t('liveUpdates') || 'Live Updates'
      };
    } else {
      return {
        icon: WifiIcon,
        color: 'default',
        text: t('manual') || 'Manual'
      };
    }
  };

  const connectionStatus = getConnectionStatus();
  const ConnectionIcon = connectionStatus.icon;

  const intervalOptions = [
    { value: 10, label: '10s' },
    { value: 30, label: '30s' },
    { value: 60, label: '1m' },
    { value: 300, label: '5m' },
    { value: 600, label: '10m' },
    { value: 1800, label: '30m' }
  ];

  return (
    <>
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <Badge 
                badgeContent={updateCount} 
                color="primary" 
                max={99}
                invisible={updateCount === 0}
              >
                <UpdateIcon color="primary" />
              </Badge>
              <Typography variant="h6" fontWeight="600">
                {t('realTimeUpdates') || 'Real-time Updates'}
              </Typography>
              <Chip
                icon={<ConnectionIcon />}
                label={connectionStatus.text}
                size="small"
                color={connectionStatus.color}
                variant={isRealTimeEnabled ? 'filled' : 'outlined'}
              />
            </Box>

            <Stack direction="row" spacing={1} alignItems="center">
              {isRealTimeEnabled && isConnected && (
                <Chip
                  icon={<ScheduleIcon />}
                  label={`${timeUntilRefresh}s`}
                  size="small"
                  color="info"
                  variant="outlined"
                />
              )}
              
              <Tooltip title={t('manualRefresh') || 'Manual Refresh'}>
                <IconButton 
                  onClick={handleManualRefresh}
                  disabled={loading}
                  color="primary"
                >
                  <RefreshIcon className={loading ? 'animate-spin' : ''} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          {/* Progress bar for loading */}
          {loading && (
            <LinearProgress 
              sx={{ 
                mb: 2, 
                borderRadius: 1,
                height: 6,
                '& .MuiLinearProgress-bar': {
                  borderRadius: 1
                }
              }} 
            />
          )}

          {/* Connection warning */}
          {!isConnected && (
            <Alert 
              severity="warning" 
              sx={{ mb: 2, borderRadius: 2 }}
              action={
                <IconButton
                  color="inherit"
                  size="small"
                  onClick={() => setIsConnected(true)}
                >
                  <RefreshIcon />
                </IconButton>
              }
            >
              {t('connectionLost') || 'Connection lost. Real-time updates are paused.'}
            </Alert>
          )}

          <Stack spacing={2}>
            {/* Real-time toggle and settings */}
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <FormControlLabel
                control={
                  <Switch
                    checked={isRealTimeEnabled}
                    onChange={handleRealTimeToggle}
                    disabled={!isConnected}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight="500">
                      {t('enableRealTime') || 'Enable Real-time Updates'}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {isRealTimeEnabled 
                        ? (t('autoRefreshEnabled') || 'Automatic refresh enabled')
                        : (t('manualRefreshOnly') || 'Manual refresh only')
                      }
                    </Typography>
                  </Box>
                }
              />

              {isRealTimeEnabled && (
                <FormControl size="small" sx={{ minWidth: 80 }}>
                  <InputLabel>{t('interval') || 'Interval'}</InputLabel>
                  <Select
                    value={refreshInterval}
                    onChange={handleIntervalChange}
                    label={t('interval') || 'Interval'}
                  >
                    {intervalOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>

            {/* Status information */}
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={2} alignItems="center">
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    {t('lastUpdated') || 'Last Updated'}
                  </Typography>
                  <Typography variant="body2" fontWeight="500">
                    {formatLastUpdated()}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    {t('dataCount') || 'Data Count'}
                  </Typography>
                  <Typography variant="body2" fontWeight="500">
                    {dataCount.toLocaleString()}
                  </Typography>
                </Box>

                {updateCount > 0 && (
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      {t('updates') || 'Updates'}
                    </Typography>
                    <Typography variant="body2" fontWeight="500" color="primary.main">
                      {updateCount}
                    </Typography>
                  </Box>
                )}
              </Stack>

              {hasChanges && (
                <Chip
                  icon={<NotificationsIcon />}
                  label={t('newChanges') || 'New Changes'}
                  size="small"
                  color="warning"
                  variant="filled"
                />
              )}
            </Box>

            {/* Performance indicator */}
            {isRealTimeEnabled && (
              <Box>
                <Typography variant="caption" color="textSecondary" gutterBottom>
                  {t('updateFrequency') || 'Update Frequency'}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <SpeedIcon fontSize="small" color="action" />
                  <LinearProgress
                    variant="determinate"
                    value={(refreshInterval - timeUntilRefresh) / refreshInterval * 100}
                    sx={{ 
                      flex: 1, 
                      height: 8, 
                      borderRadius: 4,
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4
                      }
                    }}
                  />
                  <Typography variant="caption" color="textSecondary">
                    {Math.round((refreshInterval - timeUntilRefresh) / refreshInterval * 100)}%
                  </Typography>
                </Box>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Notification snackbar */}
      <Snackbar
        open={showNotification}
        autoHideDuration={3000}
        onClose={() => setShowNotification(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setShowNotification(false)} 
          severity="info"
          sx={{ borderRadius: 2 }}
        >
          {notificationMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default RealTimeUpdates;