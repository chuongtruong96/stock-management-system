import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Chip,
  LinearProgress,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Business as BusinessIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  Star as StarIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const AnalyticsDashboard = ({ data = [], loading = false, period = {} }) => {
  const { t } = useTranslation();

  // Calculate analytics from data
  const analytics = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        totalOrders: 0,
        totalItems: 0,
        totalQuantity: 0,
        activeDepartments: 0,
        topDepartment: null,
        topProduct: null,
        departmentStats: [],
        productStats: [],
        insights: []
      };
    }

    // Basic calculations
    const totalOrders = data.length;
    const totalQuantity = data.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalItems = data.length;

    // Department analysis
    const departmentMap = data.reduce((acc, item) => {
      const dept = item.department || 'Unknown';
      if (!acc[dept]) {
        acc[dept] = { name: dept, orders: 0, quantity: 0, items: [] };
      }
      acc[dept].orders += 1;
      acc[dept].quantity += item.quantity || 0;
      acc[dept].items.push(item);
      return acc;
    }, {});

    const departmentStats = Object.values(departmentMap)
      .sort((a, b) => b.quantity - a.quantity)
      .map((dept, index) => ({
        ...dept,
        rank: index + 1,
        percentage: totalQuantity > 0 ? (dept.quantity / totalQuantity * 100) : 0,
        avgQuantity: dept.quantity / dept.orders
      }));

    const topDepartment = departmentStats[0] || null;
    const activeDepartments = departmentStats.length;

    // Product analysis
    const productMap = data.reduce((acc, item) => {
      const productKey = item.productCode || item.productNameVn || item.productNameEn || 'Unknown';
      if (!acc[productKey]) {
        acc[productKey] = {
          code: item.productCode,
          nameVn: item.productNameVn,
          nameEn: item.productNameEn,
          quantity: 0,
          orders: 0,
          departments: new Set()
        };
      }
      acc[productKey].quantity += item.quantity || 0;
      acc[productKey].orders += 1;
      acc[productKey].departments.add(item.department);
      return acc;
    }, {});

    const productStats = Object.values(productMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10)
      .map((product, index) => ({
        ...product,
        rank: index + 1,
        percentage: totalQuantity > 0 ? (product.quantity / totalQuantity * 100) : 0,
        departmentCount: product.departments.size
      }));

    const topProduct = productStats[0] || null;

    // Generate insights
    const insights = [];

    // Department insights
    if (departmentStats.length > 0) {
      const topDept = departmentStats[0];
      if (topDept.percentage > 40) {
        insights.push({
          type: 'warning',
          title: t('highDepartmentConcentration') || 'High Department Concentration',
          message: t('departmentDominance', { dept: topDept.name, percent: topDept.percentage.toFixed(1) }) || 
                   `${topDept.name} accounts for ${topDept.percentage.toFixed(1)}% of all requests`,
          icon: WarningIcon,
          color: 'warning'
        });
      }

      if (departmentStats.length >= 5) {
        insights.push({
          type: 'success',
          title: t('goodDepartmentDistribution') || 'Good Department Distribution',
          message: t('activeDepartmentCount', { count: departmentStats.length }) || 
                   `${departmentStats.length} departments are actively making requests`,
          icon: CheckCircleIcon,
          color: 'success'
        });
      }
    }

    // Product insights
    if (productStats.length > 0) {
      const topProd = productStats[0];
      if (topProd.percentage > 25) {
        insights.push({
          type: 'info',
          title: t('popularProduct') || 'Popular Product',
          message: t('productPopularity', { product: topProd.nameVn || topProd.nameEn || topProd.code, percent: topProd.percentage.toFixed(1) }) || 
                   `${topProd.nameVn || topProd.nameEn || topProd.code} is highly requested (${topProd.percentage.toFixed(1)}%)`,
          icon: StarIcon,
          color: 'info'
        });
      }
    }

    // Volume insights
    const avgQuantityPerOrder = totalQuantity / totalOrders;
    if (avgQuantityPerOrder > 10) {
      insights.push({
        type: 'success',
        title: t('highVolumeOrders') || 'High Volume Orders',
        message: t('averageQuantity', { avg: avgQuantityPerOrder.toFixed(1) }) || 
                 `Average ${avgQuantityPerOrder.toFixed(1)} items per order`,
        icon: TrendingUpIcon,
        color: 'success'
      });
    }

    return {
      totalOrders,
      totalItems,
      totalQuantity,
      activeDepartments,
      topDepartment,
      topProduct,
      departmentStats: departmentStats.slice(0, 5),
      productStats: productStats.slice(0, 5),
      insights: insights.slice(0, 4),
      avgQuantityPerOrder
    };
  }, [data, t]);

  const MetricCard = ({ title, value, subtitle, icon: Icon, color = 'primary', trend = null }) => (
    <Card sx={{ 
      height: '100%', 
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
          {trend && (
            <Chip
              icon={trend > 0 ? <TrendingUpIcon /> : trend < 0 ? <TrendingDownIcon /> : <TrendingFlatIcon />}
              label={`${trend > 0 ? '+' : ''}${trend}%`}
              size="small"
              color={trend > 0 ? 'success' : trend < 0 ? 'error' : 'default'}
              variant="outlined"
            />
          )}
        </Box>
        <Typography variant="h4" fontWeight="bold" color={`${color}.main`} gutterBottom>
          {loading ? '...' : value}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const InsightCard = ({ insight }) => {
    const IconComponent = insight.icon;
    return (
      <Card sx={{ 
        borderRadius: 2,
        border: 1,
        borderColor: `${insight.color}.light`,
        bgcolor: `${insight.color}.50`
      }}>
        <CardContent sx={{ p: 2 }}>
          <Box display="flex" alignItems="flex-start" gap={2}>
            <Avatar sx={{ bgcolor: `${insight.color}.main`, width: 32, height: 32 }}>
              <IconComponent fontSize="small" />
            </Avatar>
            <Box flex={1}>
              <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                {insight.title}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {insight.message}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          {t('loadingAnalytics') || 'Loading Analytics...'}
        </Typography>
        <LinearProgress sx={{ borderRadius: 1 }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Key Metrics */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title={t('totalOrders') || 'Total Orders'}
            value={analytics.totalOrders}
            subtitle={`${period.month}/${period.year}`}
            icon={ShoppingCartIcon}
            color="primary"
            trend={12}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title={t('totalQuantity') || 'Total Quantity'}
            value={analytics.totalQuantity}
            subtitle={t('itemsRequested') || 'Items Requested'}
            icon={InventoryIcon}
            color="success"
            trend={8}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title={t('activeDepartments') || 'Active Departments'}
            value={analytics.activeDepartments}
            subtitle={t('makingRequests') || 'Making Requests'}
            icon={BusinessIcon}
            color="info"
            trend={3}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title={t('avgPerOrder') || 'Avg per Order'}
            value={analytics.avgQuantityPerOrder?.toFixed(1) || '0'}
            subtitle={t('itemsPerOrder') || 'Items per Order'}
            icon={PeopleIcon}
            color="warning"
            trend={-2}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Top Departments */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                <Typography variant="h6" fontWeight="600">
                  {t('topDepartments') || 'Top Departments'}
                </Typography>
                <Chip 
                  label={`Top ${analytics.departmentStats.length}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>
              
              <List sx={{ p: 0 }}>
                {analytics.departmentStats.map((dept, index) => (
                  <React.Fragment key={dept.name}>
                    <ListItem sx={{ px: 0, py: 1.5 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          bgcolor: index === 0 ? 'primary.main' : 'grey.100',
                          color: index === 0 ? 'white' : 'text.primary',
                          width: 40,
                          height: 40
                        }}>
                          {dept.rank}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Typography variant="subtitle2" fontWeight="500">
                              {dept.name}
                            </Typography>
                            <Typography variant="body2" color="primary.main" fontWeight="600">
                              {dept.quantity}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Box display="flex" alignItems="center" justifyContent="space-between" mt={0.5}>
                              <Typography variant="caption" color="textSecondary">
                                {dept.orders} orders • {dept.percentage.toFixed(1)}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={dept.percentage}
                              sx={{
                                mt: 1,
                                height: 6,
                                borderRadius: 3,
                                bgcolor: 'grey.200',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 3,
                                  bgcolor: index === 0 ? 'primary.main' : 'grey.400'
                                }
                              }}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < analytics.departmentStats.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Products */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                <Typography variant="h6" fontWeight="600">
                  {t('topProducts') || 'Top Products'}
                </Typography>
                <Chip 
                  label={`Top ${analytics.productStats.length}`}
                  size="small"
                  color="success"
                  variant="outlined"
                />
              </Box>
              
              <List sx={{ p: 0 }}>
                {analytics.productStats.map((product, index) => (
                  <React.Fragment key={product.code || index}>
                    <ListItem sx={{ px: 0, py: 1.5 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          bgcolor: index === 0 ? 'success.main' : 'grey.100',
                          color: index === 0 ? 'white' : 'text.primary',
                          width: 40,
                          height: 40
                        }}>
                          {product.rank}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Typography variant="subtitle2" fontWeight="500" sx={{ 
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '200px'
                            }}>
                              {product.nameVn || product.nameEn || product.code}
                            </Typography>
                            <Typography variant="body2" color="success.main" fontWeight="600">
                              {product.quantity}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Box display="flex" alignItems="center" justifyContent="space-between" mt={0.5}>
                              <Typography variant="caption" color="textSecondary">
                                {product.orders} orders • {product.departmentCount} depts
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={product.percentage}
                              sx={{
                                mt: 1,
                                height: 6,
                                borderRadius: 3,
                                bgcolor: 'grey.200',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 3,
                                  bgcolor: index === 0 ? 'success.main' : 'grey.400'
                                }
                              }}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < analytics.productStats.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Insights */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                <Typography variant="h6" fontWeight="600">
                  {t('insights') || 'Insights & Recommendations'}
                </Typography>
                <Chip 
                  label={`${analytics.insights.length} ${t('insights') || 'insights'}`}
                  size="small"
                  color="info"
                  variant="outlined"
                />
              </Box>
              
              {analytics.insights.length > 0 ? (
                <Grid container spacing={2}>
                  {analytics.insights.map((insight, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <InsightCard insight={insight} />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <InfoIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body1" color="textSecondary">
                    {t('noInsights') || 'No insights available for this period'}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsDashboard;