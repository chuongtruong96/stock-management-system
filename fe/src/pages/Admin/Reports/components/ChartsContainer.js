import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tabs,
  Tab,
  useTheme,
  Chip,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import {
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  TrendingUp as LineChartIcon,
  DonutLarge as DonutIcon,
  Fullscreen as FullscreenIcon,
  GetApp as DownloadIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const ChartsContainer = ({ data = [], loading = false }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [activeTab, setActiveTab] = React.useState(0);

  // Color palette for charts
  const colors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#ff7300',
    '#00ff00',
    '#0088fe'
  ];

  // Process data for different chart types
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Department-wise data aggregation
    const departmentData = data.reduce((acc, item) => {
      const dept = item.department || 'Unknown';
      if (!acc[dept]) {
        acc[dept] = { department: dept, totalQuantity: 0, itemCount: 0, items: [] };
      }
      acc[dept].totalQuantity += item.quantity || 0;
      acc[dept].itemCount += 1;
      acc[dept].items.push(item);
      return acc;
    }, {});

    const departmentChartData = Object.values(departmentData).map(dept => ({
      name: dept.department,
      quantity: dept.totalQuantity,
      items: dept.itemCount,
      avgQuantity: Math.round(dept.totalQuantity / dept.itemCount)
    }));

    // Product-wise data (top 10)
    const productData = data
      .sort((a, b) => (b.quantity || 0) - (a.quantity || 0))
      .slice(0, 10)
      .map(item => ({
        name: item.productNameVn || item.productNameEn || item.productCode || 'Unknown',
        quantity: item.quantity || 0,
        department: item.department || 'Unknown',
        code: item.productCode || ''
      }));

    // Monthly trend data (simulated for demo)
    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const month = new Date();
      month.setMonth(month.getMonth() - (5 - i));
      return {
        month: month.toLocaleDateString('en-US', { month: 'short' }),
        orders: Math.floor(Math.random() * 50) + 20,
        items: Math.floor(Math.random() * 200) + 100,
        departments: Math.floor(Math.random() * 8) + 3
      };
    });

    // Category distribution (simulated)
    const categoryData = [
      { name: 'Office Supplies', value: 35, count: Math.floor(data.length * 0.35) },
      { name: 'Electronics', value: 25, count: Math.floor(data.length * 0.25) },
      { name: 'Furniture', value: 20, count: Math.floor(data.length * 0.20) },
      { name: 'Stationery', value: 15, count: Math.floor(data.length * 0.15) },
      { name: 'Others', value: 5, count: Math.floor(data.length * 0.05) }
    ];

    return {
      departmentData: departmentChartData,
      productData,
      monthlyData,
      categoryData
    };
  }, [data]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            bgcolor: 'background.paper',
            p: 2,
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
            boxShadow: 3
          }}
        >
          <Typography variant="subtitle2" gutterBottom>
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{ color: entry.color }}
            >
              {entry.name}: {entry.value}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  const chartTabs = [
    {
      label: t('departmentAnalysis') || 'Department Analysis',
      icon: BarChartIcon,
      value: 0
    },
    {
      label: t('topProducts') || 'Top Products',
      icon: PieChartIcon,
      value: 1
    },
    {
      label: t('trends') || 'Trends',
      icon: LineChartIcon,
      value: 2
    },
    {
      label: t('categories') || 'Categories',
      icon: DonutIcon,
      value: 3
    }
  ];

  if (loading || !chartData) {
    return (
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              {loading ? (t('loadingCharts') || 'Loading charts...') : (t('noDataForCharts') || 'No data available for charts')}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      <CardContent sx={{ p: 0 }}>
        {/* Chart Header */}
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                {t('dataVisualization') || 'Data Visualization'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {t('interactiveCharts') || 'Interactive charts and analytics'}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Tooltip title={t('downloadChart') || 'Download Chart'}>
                <IconButton size="small">
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('fullscreen') || 'Fullscreen'}>
                <IconButton size="small">
                  <FullscreenIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>

          {/* Chart Tabs */}
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              mt: 2,
              '& .MuiTab-root': {
                minHeight: 48,
                textTransform: 'none',
                fontWeight: 500
              }
            }}
          >
            {chartTabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <Tab
                  key={tab.value}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconComponent fontSize="small" />
                      {tab.label}
                    </Box>
                  }
                  value={tab.value}
                />
              );
            })}
          </Tabs>
        </Box>

        {/* Chart Content */}
        <Box sx={{ p: 3 }}>
          {/* Department Analysis */}
          {activeTab === 0 && (
            <Box>
              <Box display="flex" alignItems="center" justifyContent="between" mb={2}>
                <Typography variant="subtitle1" fontWeight="600">
                  {t('departmentComparison') || 'Department Comparison'}
                </Typography>
                <Chip 
                  label={`${chartData.departmentData.length} ${t('departments') || 'departments'}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData.departmentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar 
                    dataKey="quantity" 
                    fill={colors[0]} 
                    name={t('totalQuantity') || 'Total Quantity'}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="items" 
                    fill={colors[1]} 
                    name={t('itemCount') || 'Item Count'}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          )}

          {/* Top Products */}
          {activeTab === 1 && (
            <Box>
              <Box display="flex" alignItems="center" justifyContent="between" mb={2}>
                <Typography variant="subtitle1" fontWeight="600">
                  {t('topRequestedProducts') || 'Top Requested Products'}
                </Typography>
                <Chip 
                  label={t('top10') || 'Top 10'}
                  size="small"
                  color="success"
                  variant="outlined"
                />
              </Box>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData.productData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="quantity" 
                    fill={colors[2]} 
                    name={t('quantity') || 'Quantity'}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          )}

          {/* Trends */}
          {activeTab === 2 && (
            <Box>
              <Box display="flex" alignItems="center" justifyContent="between" mb={2}>
                <Typography variant="subtitle1" fontWeight="600">
                  {t('monthlyTrends') || 'Monthly Trends'}
                </Typography>
                <Chip 
                  label={t('last6Months') || 'Last 6 Months'}
                  size="small"
                  color="info"
                  variant="outlined"
                />
              </Box>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={chartData.monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="orders"
                    stackId="1"
                    stroke={colors[0]}
                    fill={colors[0]}
                    fillOpacity={0.6}
                    name={t('orders') || 'Orders'}
                  />
                  <Area
                    type="monotone"
                    dataKey="items"
                    stackId="2"
                    stroke={colors[1]}
                    fill={colors[1]}
                    fillOpacity={0.6}
                    name={t('items') || 'Items'}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          )}

          {/* Categories */}
          {activeTab === 3 && (
            <Box>
              <Box display="flex" alignItems="center" justifyContent="between" mb={2}>
                <Typography variant="subtitle1" fontWeight="600">
                  {t('categoryDistribution') || 'Category Distribution'}
                </Typography>
                <Chip 
                  label={`${chartData.categoryData.length} ${t('categories') || 'categories'}`}
                  size="small"
                  color="warning"
                  variant="outlined"
                />
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={chartData.categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {chartData.categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ pt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {t('categoryBreakdown') || 'Category Breakdown'}
                    </Typography>
                    {chartData.categoryData.map((category, index) => (
                      <Box key={category.name} sx={{ mb: 2 }}>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Box
                              sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                bgcolor: colors[index % colors.length]
                              }}
                            />
                            <Typography variant="body2" fontWeight="500">
                              {category.name}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="textSecondary">
                            {category.count} items
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            width: '100%',
                            height: 6,
                            bgcolor: 'grey.200',
                            borderRadius: 3,
                            overflow: 'hidden'
                          }}
                        >
                          <Box
                            sx={{
                              width: `${category.value}%`,
                              height: '100%',
                              bgcolor: colors[index % colors.length],
                              borderRadius: 3
                            }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ChartsContainer;