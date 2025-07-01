import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  Stack,
  Divider,
  LinearProgress,
  IconButton,
  Tooltip,
  Alert
} from '@mui/material';
import {
  Compare as CompareIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  SwapHoriz as SwapIcon,
  Analytics as AnalyticsIcon,
  CalendarToday as CalendarIcon,
  Business as BusinessIcon,
  Inventory as InventoryIcon
} from '@mui/icons-material';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useTranslation } from 'react-i18next';

const ComparativeAnalysis = ({ currentData = [], loading = false, currentPeriod = {} }) => {
  const { t } = useTranslation();
  const [comparisonType, setComparisonType] = useState('previous-month');
  const [selectedMetric, setSelectedMetric] = useState('quantity');

  // Generate comparison data (simulated for demo)
  const comparisonData = useMemo(() => {
    if (!currentData || currentData.length === 0) return null;

    // Current period analysis
    const currentAnalysis = {
      totalOrders: currentData.length,
      totalQuantity: currentData.reduce((sum, item) => sum + (item.quantity || 0), 0),
      departments: new Set(currentData.map(item => item.department)).size,
      avgQuantity: currentData.reduce((sum, item) => sum + (item.quantity || 0), 0) / currentData.length
    };

    // Simulated previous period data (for demo purposes)
    const previousAnalysis = {
      totalOrders: Math.floor(currentAnalysis.totalOrders * (0.8 + Math.random() * 0.4)),
      totalQuantity: Math.floor(currentAnalysis.totalQuantity * (0.7 + Math.random() * 0.6)),
      departments: Math.max(1, currentAnalysis.departments - Math.floor(Math.random() * 3)),
      avgQuantity: 0
    };
    previousAnalysis.avgQuantity = previousAnalysis.totalQuantity / previousAnalysis.totalOrders;

    // Calculate changes
    const changes = {
      totalOrders: ((currentAnalysis.totalOrders - previousAnalysis.totalOrders) / previousAnalysis.totalOrders * 100),
      totalQuantity: ((currentAnalysis.totalQuantity - previousAnalysis.totalQuantity) / previousAnalysis.totalQuantity * 100),
      departments: ((currentAnalysis.departments - previousAnalysis.departments) / previousAnalysis.departments * 100),
      avgQuantity: ((currentAnalysis.avgQuantity - previousAnalysis.avgQuantity) / previousAnalysis.avgQuantity * 100)
    };

    // Department comparison
    const currentDeptMap = currentData.reduce((acc, item) => {
      const dept = item.department || 'Unknown';
      if (!acc[dept]) acc[dept] = { orders: 0, quantity: 0 };
      acc[dept].orders += 1;
      acc[dept].quantity += item.quantity || 0;
      return acc;
    }, {});

    // Simulated previous department data
    const previousDeptMap = {};
    Object.keys(currentDeptMap).forEach(dept => {
      previousDeptMap[dept] = {
        orders: Math.floor(currentDeptMap[dept].orders * (0.7 + Math.random() * 0.6)),
        quantity: Math.floor(currentDeptMap[dept].quantity * (0.6 + Math.random() * 0.8))
      };
    });

    const departmentComparison = Object.keys(currentDeptMap).map(dept => ({
      department: dept,
      current: currentDeptMap[dept],
      previous: previousDeptMap[dept] || { orders: 0, quantity: 0 },
      change: {
        orders: previousDeptMap[dept] ? 
          ((currentDeptMap[dept].orders - previousDeptMap[dept].orders) / previousDeptMap[dept].orders * 100) : 100,
        quantity: previousDeptMap[dept] ? 
          ((currentDeptMap[dept].quantity - previousDeptMap[dept].quantity) / previousDeptMap[dept].quantity * 100) : 100
      }
    })).sort((a, b) => b.current.quantity - a.current.quantity);

    // Chart data for trends
    const chartData = departmentComparison.slice(0, 6).map(dept => ({
      name: dept.department,
      current: dept.current[selectedMetric],
      previous: dept.previous[selectedMetric],
      change: dept.change[selectedMetric]
    }));

    return {
      current: currentAnalysis,
      previous: previousAnalysis,
      changes,
      departmentComparison,
      chartData
    };
  }, [currentData, selectedMetric]);

  const comparisonTypes = [
    { value: 'previous-month', label: t('previousMonth') || 'Previous Month' },
    { value: 'same-month-last-year', label: t('sameMonthLastYear') || 'Same Month Last Year' },
    { value: 'quarter', label: t('previousQuarter') || 'Previous Quarter' },
    { value: 'year', label: t('previousYear') || 'Previous Year' }
  ];

  const metrics = [
    { value: 'quantity', label: t('quantity') || 'Quantity', icon: InventoryIcon },
    { value: 'orders', label: t('orders') || 'Orders', icon: BusinessIcon }
  ];

  const MetricComparisonCard = ({ title, current, previous, change, icon: Icon, color = 'primary' }) => {
    const isPositive = change > 0;
    const isNegative = change < 0;
    
    return (
      <Card sx={{ 
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
        }
      }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Avatar sx={{ bgcolor: `${color}.main`, width: 48, height: 48 }}>
              <Icon />
            </Avatar>
            <Chip
              icon={isPositive ? <TrendingUpIcon /> : isNegative ? <TrendingDownIcon /> : <SwapIcon />}
              label={`${isPositive ? '+' : ''}${change.toFixed(1)}%`}
              size="small"
              color={isPositive ? 'success' : isNegative ? 'error' : 'default'}
              variant="filled"
            />
          </Box>
          
          <Typography variant="h5" fontWeight="bold" color={`${color}.main`} gutterBottom>
            {current}
          </Typography>
          
          <Typography variant="body2" color="textSecondary" gutterBottom>
            {title}
          </Typography>
          
          <Box display="flex" alignItems="center" gap={1} mt={2}>
            <Typography variant="caption" color="textSecondary">
              {t('previous') || 'Previous'}: {previous}
            </Typography>
            <Divider orientation="vertical" flexItem />
            <Typography 
              variant="caption" 
              color={isPositive ? 'success.main' : isNegative ? 'error.main' : 'textSecondary'}
              fontWeight="600"
            >
              {isPositive ? '+' : ''}{(current - previous)} {t('change') || 'change'}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const DepartmentComparisonRow = ({ department, current, previous, change }) => {
    const isPositive = change[selectedMetric] > 0;
    const currentValue = current[selectedMetric];
    const previousValue = previous[selectedMetric];
    const changePercent = change[selectedMetric];
    
    return (
      <Box sx={{ py: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="subtitle2" fontWeight="600">
            {department}
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" fontWeight="600" color="primary.main">
              {currentValue}
            </Typography>
            <Chip
              label={`${isPositive ? '+' : ''}${changePercent.toFixed(1)}%`}
              size="small"
              color={isPositive ? 'success' : changePercent < 0 ? 'error' : 'default'}
              variant="outlined"
            />
          </Box>
        </Box>
        
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="caption" color="textSecondary" sx={{ minWidth: 80 }}>
            {t('current') || 'Current'}: {currentValue}
          </Typography>
          <Typography variant="caption" color="textSecondary" sx={{ minWidth: 80 }}>
            {t('previous') || 'Previous'}: {previousValue}
          </Typography>
          <Box flex={1}>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, (currentValue / Math.max(currentValue, previousValue)) * 100)}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  bgcolor: isPositive ? 'success.main' : changePercent < 0 ? 'error.main' : 'primary.main'
                }
              }}
            />
          </Box>
        </Box>
      </Box>
    );
  };

  if (loading || !comparisonData) {
    return (
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="textSecondary">
              {loading ? (t('loadingComparison') || 'Loading comparison...') : (t('noDataForComparison') || 'No data available for comparison')}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {/* Controls */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Box display="flex" alignItems="center" gap={2}>
              <CompareIcon color="primary" />
              <Typography variant="h6" fontWeight="600">
                {t('comparativeAnalysis') || 'Comparative Analysis'}
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="medium">
                <InputLabel sx={{ color: '#000000' }}>{t('compareWith') || 'Compare With'}</InputLabel>
                <Select
                  value={comparisonType}
                  label={t('compareWith') || 'Compare With'}
                  onChange={(e) => setComparisonType(e.target.value)}
                  startAdornment={<CalendarIcon sx={{ mr: 1, color: 'action.active' }} />}
                  sx={{
                    '& .MuiSelect-select': {
                      color: '#000000', // Black text color
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#000000', // Black border
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#333333', // Darker border on hover
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main', // Primary color when focused
                    }
                  }}
                >
                  {comparisonTypes.map((type) => (
                    <MenuItem 
                      key={type.value} 
                      value={type.value}
                      sx={{ color: '#000000' }} // Black text in dropdown items
                    >
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="medium">
                <InputLabel sx={{ color: '#000000' }}>{t('metric') || 'Metric'}</InputLabel>
                <Select
                  value={selectedMetric}
                  label={t('metric') || 'Metric'}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  sx={{
                    '& .MuiSelect-select': {
                      color: '#000000', // Black text color
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#000000', // Black border
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#333333', // Darker border on hover
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main', // Primary color when focused
                    }
                  }}
                >
                  {metrics.map((metric) => {
                    const IconComponent = metric.icon;
                    return (
                      <MenuItem 
                        key={metric.value} 
                        value={metric.value}
                        sx={{ color: '#000000' }} // Black text in dropdown items
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconComponent fontSize="small" />
                          {metric.label}
                        </Box>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                <Typography variant="caption">
                  {t('comparisonNote') || 'Comparing current period with selected timeframe'}
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Key Metrics Comparison */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricComparisonCard
            title={t('totalOrders') || 'Total Orders'}
            current={comparisonData.current.totalOrders}
            previous={comparisonData.previous.totalOrders}
            change={comparisonData.changes.totalOrders}
            icon={BusinessIcon}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricComparisonCard
            title={t('totalQuantity') || 'Total Quantity'}
            current={comparisonData.current.totalQuantity}
            previous={comparisonData.previous.totalQuantity}
            change={comparisonData.changes.totalQuantity}
            icon={InventoryIcon}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricComparisonCard
            title={t('activeDepartments') || 'Active Departments'}
            current={comparisonData.current.departments}
            previous={comparisonData.previous.departments}
            change={comparisonData.changes.departments}
            icon={BusinessIcon}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricComparisonCard
            title={t('avgQuantity') || 'Avg Quantity'}
            current={comparisonData.current.avgQuantity.toFixed(1)}
            previous={comparisonData.previous.avgQuantity.toFixed(1)}
            change={comparisonData.changes.avgQuantity}
            icon={AnalyticsIcon}
            color="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Comparison Chart */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                {t('departmentComparison') || 'Department Comparison'}
              </Typography>
              <Typography variant="body2" color="textSecondary" mb={3}>
                {t('currentVsPrevious') || 'Current vs Previous Period'}
              </Typography>
              
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={comparisonData.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <RechartsTooltip />
                  <Legend />
                  <Bar 
                    dataKey="current" 
                    fill="#1976d2" 
                    name={t('current') || 'Current'}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="previous" 
                    fill="#90caf9" 
                    name={t('previous') || 'Previous'}
                    radius={[4, 4, 0, 0]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="change" 
                    stroke="#f44336" 
                    strokeWidth={3}
                    name={t('changePercent') || 'Change %'}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Department Rankings */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                {t('departmentRankings') || 'Department Rankings'}
              </Typography>
              <Typography variant="body2" color="textSecondary" mb={3}>
                {t('bySelectedMetric') || 'By selected metric'}
              </Typography>
              
              <Box sx={{ maxHeight: 350, overflowY: 'auto' }}>
                {comparisonData.departmentComparison.slice(0, 8).map((dept, index) => (
                  <DepartmentComparisonRow
                    key={dept.department}
                    department={dept.department}
                    current={dept.current}
                    previous={dept.previous}
                    change={dept.change}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ComparativeAnalysis;