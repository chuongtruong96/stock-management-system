import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Grid,
  Card,
  CircularProgress,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Paper,
  useTheme,
  alpha,
  LinearProgress,
  Avatar,
  Skeleton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Assignment as AssignmentIcon,
  Category as CategoryIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Star as StarIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

// Components
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import MDButton from "components/template/MDButton";

// Services
import { orderApi, productApi, userApi, categoryApi, unitApi, departmentApi } from "services/api";

// Layout
import AdminLayout from "layouts/AdminLayout";

// Enhanced Welcome Header Component with Gradient
const WelcomeHeader = ({ lastRefresh, onRefresh, refreshing }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";
  
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        mb: 4, 
        borderRadius: 3,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative background elements */}
      <Box sx={{
        position: 'absolute',
        top: -50,
        right: -50,
        width: 150,
        height: 150,
        borderRadius: '50%',
        bgcolor: 'rgba(255,255,255,0.1)',
        zIndex: 1
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: -30,
        left: -30,
        width: 100,
        height: 100,
        borderRadius: '50%',
        bgcolor: 'rgba(255,255,255,0.05)',
        zIndex: 1
      }} />
      
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: 'relative', zIndex: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 64, height: 64 }}>
            <DashboardIcon fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              👋 {greeting}, Admin!
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Here's what's happening in your system today
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Last updated
            </Typography>
            <Typography variant="h6" fontWeight="medium">
              {lastRefresh.toLocaleTimeString()}
            </Typography>
          </Box>
          <Tooltip title="Refresh Dashboard">
            <IconButton 
              onClick={onRefresh} 
              disabled={refreshing}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                "&:hover": { bgcolor: 'rgba(255,255,255,0.3)' }
              }}
            >
              <RefreshIcon sx={{ 
                animation: refreshing ? "spin 1s linear infinite" : "none",
                "@keyframes spin": {
                  "0%": { transform: "rotate(0deg)" },
                  "100%": { transform: "rotate(360deg)" }
                }
              }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Paper>
  );
};

// Enhanced Metric Card with Gradients and Trends
const EnhancedMetricCard = ({ title, value, trend, trendValue, icon: Icon, color, route, loading, subtitle }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  const gradients = {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    warning: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    info: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    error: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  };
  
  const handleClick = () => {
    if (route) {
      navigate(route);
    }
  };
  
  if (loading) {
    return (
      <Card elevation={3} sx={{ borderRadius: 3, height: 220, minHeight: 220 }}>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
            <Skeleton variant="rectangular" width={56} height={56} sx={{ borderRadius: 2 }} />
            <Skeleton variant="text" width={60} height={24} />
          </Box>
          <Skeleton variant="text" width="60%" height={48} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="80%" height={24} />
          <Skeleton variant="text" width="60%" height={20} sx={{ mt: 1 }} />
        </Box>
      </Card>
    );
  }
  
  const isPositiveTrend = trend === "up";
  
  return (
    <Card
      elevation={3}
      onClick={handleClick}
      sx={{
        borderRadius: 3,
        height: 220,
        minHeight: 220,
        background: gradients[color] || gradients.primary,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        cursor: route ? "pointer" : "default",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": route ? {
          transform: "translateY(-6px)",
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        } : {},
      }}
    >
      {/* Decorative background elements */}
      <Box sx={{
        position: 'absolute',
        top: -30,
        right: -30,
        width: 120,
        height: 120,
        borderRadius: '50%',
        bgcolor: 'rgba(255,255,255,0.1)',
        zIndex: 1
      }} />
      
      <Box sx={{ p: 3, position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
            <Icon fontSize="large" />
          </Avatar>
          {trend && trendValue && (
            <Chip
              icon={isPositiveTrend ? <TrendingUpIcon /> : <TrendingDownIcon />}
              label={trendValue}
              size="small"
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                fontWeight: 'bold'
              }}
            />
          )}
        </Box>

        <Typography 
          variant="h3" 
          fontWeight="bold" 
          gutterBottom 
          sx={{ 
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          {typeof value === "number" ? value.toLocaleString() : value}
        </Typography>

        <Typography 
          variant="h6" 
          sx={{ 
            opacity: 0.9,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            mb: 1
          }}
        >
          {title}
        </Typography>

        {subtitle && (
          <Typography 
            variant="body2" 
            sx={{ 
              opacity: 0.7,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              mt: 'auto'
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Card>
  );
};

// Enhanced Quick Action Card
const EnhancedQuickActionCard = ({ title, description, icon: Icon, color, onClick, badge, loading }) => {
  const theme = useTheme();
  
  const getColor = (colorName) => {
    const colorMap = {
      primary: theme.palette.primary.main,
      success: theme.palette.success.main,
      warning: theme.palette.warning.main,
      error: theme.palette.error.main,
      info: theme.palette.info.main,
      secondary: theme.palette.secondary.main,
    };
    return colorMap[colorName] || theme.palette.primary.main;
  };
  
  const cardColor = getColor(color);
  
  if (loading) {
    return (
      <Card elevation={2} sx={{ p: 3, borderRadius: 3, height: 140 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, height: "100%" }}>
          <Skeleton variant="rectangular" width={48} height={48} sx={{ borderRadius: 2 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="80%" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="60%" height={20} />
          </Box>
        </Box>
      </Card>
    );
  }
  
  return (
    <Card
      onClick={onClick}
      sx={{
        p: 3,
        borderRadius: 3,
        height: 140,
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        background: `linear-gradient(135deg, ${alpha(cardColor, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
        border: `1px solid ${alpha(cardColor, 0.2)}`,
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: theme.shadows[6],
          border: `1px solid ${alpha(cardColor, 0.4)}`,
          background: `linear-gradient(135deg, ${alpha(cardColor, 0.15)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, height: "100%" }}>
        <Box sx={{ position: "relative" }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha(cardColor, 0.15),
              color: cardColor,
            }}
          >
            <Icon fontSize="medium" />
          </Box>
          {badge && badge > 0 && (
            <Box
              sx={{
                position: "absolute",
                top: -8,
                right: -8,
                minWidth: 24,
                height: 24,
                borderRadius: "50%",
                bgcolor: theme.palette.error.main,
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                fontWeight: "bold",
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            >
              {badge > 99 ? "99+" : badge}
            </Box>
          )}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography 
            variant="h6" 
            fontWeight="bold" 
            gutterBottom 
            sx={{ 
              color: theme.palette.text.primary,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}
          >
            {title}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: theme.palette.text.secondary,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "block"
            }}
          >
            {description}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
};

// Progress Bar Analytics Component
const ProgressBarAnalytics = ({ data, title, color, icon: Icon }) => {
  const theme = useTheme();
  
  return (
    <Card elevation={2} sx={{ borderRadius: 3, height: '100%' }}>
      <Box sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Avatar sx={{ bgcolor: `${color}.main`, width: 40, height: 40 }}>
            <Icon fontSize="small" />
          </Avatar>
          <Typography variant="h6" fontWeight="600">
            {title}
          </Typography>
        </Box>
        
        <List sx={{ p: 0 }}>
          {data.slice(0, 5).map((item, index) => (
            <Box key={index}>
              <ListItem sx={{ px: 0, py: 1.5 }}>
                <ListItemAvatar>
                  <Avatar sx={{ 
                    bgcolor: index === 0 ? `${color}.main` : 'grey.100',
                    color: index === 0 ? 'white' : 'text.primary',
                    width: 32,
                    height: 32,
                    fontSize: '0.875rem',
                    fontWeight: 'bold'
                  }}>
                    {index + 1}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography 
                        variant="subtitle2" 
                        fontWeight="500"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '150px'
                        }}
                      >
                        {item.name}
                      </Typography>
                      <Typography variant="body2" color={`${color}.main`} fontWeight="600">
                        {item.value}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        {item.subtitle || `${item.percentage?.toFixed(1)}% of total`}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={item.percentage || 0}
                        sx={{
                          mt: 1,
                          height: 6,
                          borderRadius: 3,
                          bgcolor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            bgcolor: index === 0 ? `${color}.main` : 'grey.400'
                          }
                        }}
                      />
                    </Box>
                  }
                />
              </ListItem>
              {index < Math.min(data.length - 1, 4) && <Divider />}
            </Box>
          ))}
        </List>
      </Box>
    </Card>
  );
};

// Insight Card Component
const InsightCard = ({ insight }) => {
  const IconComponent = insight.icon;
  return (
    <Card sx={{ 
      borderRadius: 2,
      border: 1,
      borderColor: `${insight.color}.light`,
      bgcolor: alpha(insight.color === 'warning' ? '#fa709a' : insight.color === 'success' ? '#4facfe' : '#a8edea', 0.1)
    }}>
      <Box sx={{ p: 2.5 }}>
        <Box display="flex" alignItems="flex-start" gap={2}>
          <Avatar sx={{ bgcolor: `${insight.color}.main`, width: 36, height: 36 }}>
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
      </Box>
    </Card>
  );
};

// Enhanced Recent Activity Component
const EnhancedRecentActivity = ({ activities, loading }) => {
  const theme = useTheme();
  
  if (loading) {
    return (
      <Card elevation={2} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom>Recent Activity</Typography>
        {[...Array(5)].map((_, index) => (
          <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="70%" height={20} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="40%" height={16} />
            </Box>
            <Skeleton variant="text" width={60} height={16} />
          </Box>
        ))}
      </Card>
    );
  }
  
  return (
    <Card elevation={2} sx={{ p: 3, borderRadius: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
            <ScheduleIcon />
          </Avatar>
          <Typography variant="h6" fontWeight="600">
            Recent Activity
          </Typography>
        </Box>
        <MDButton variant="text" size="small">
          View All
        </MDButton>
      </Box>
      
      <Box sx={{ maxHeight: 400, overflow: "auto" }}>
        {activities && activities.length > 0 ? activities.slice(0, 8).map((activity, index) => (
          <Box 
            key={index}
            sx={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              p: 2,
              mb: 1,
              borderRadius: 2,
              bgcolor: index % 2 === 0 ? alpha(theme.palette.primary.main, 0.03) : "transparent",
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              "&:hover": {
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                transform: "translateX(4px)",
                transition: "all 0.2s ease"
              }
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar sx={{ width: 40, height: 40, bgcolor: theme.palette.primary.main, fontSize: "1rem" }}>
                {activity.type === "order" ? "📋" : activity.type === "product" ? "📦" : "👤"}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography 
                  variant="body1" 
                  fontWeight="500"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}
                >
                  {activity.description}
                </Typography>
                <Typography 
                  variant="caption" 
                  color="textSecondary"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: "block"
                  }}
                >
                  {activity.user || "System"}
                </Typography>
              </Box>
            </Box>
            <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
              {activity.time}
            </Typography>
          </Box>
        )) : (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <ScheduleIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography variant="body1" color="textSecondary">
              No recent activity
            </Typography>
          </Box>
        )}
      </Box>
    </Card>
  );
};

// Main Enhanced AdminDashboard Component
export default function EnhancedAdminDashboard() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Dashboard data state
  const [tableData, setTableData] = useState({
    orders: [],
    products: [],
    users: [],
    categories: [],
    units: [],
    departments: [],
  });

  // Enhanced data fetching with proper error handling
  const fetchTableData = useCallback(async () => {
    try {
      console.log('🔍 Dashboard: Starting data fetch...');
      
      const [orders, products, users, categories, units, departments] = await Promise.allSettled([
        orderApi.all(),
        productApi.all(),
        userApi.getUsers(),
        categoryApi.all(),
        unitApi.all(),
        departmentApi.all(),
      ]);

      console.log('🔍 Dashboard: API responses received');

      const extractData = (response, dataType) => {
        if (response.status !== 'fulfilled') {
          console.warn(`Failed to fetch ${dataType}:`, response.reason);
          return [];
        }

        const value = response.value;
        console.log(`Processing ${dataType}:`, value);

        // Handle paginated response (has content property)
        if (value && value.content && Array.isArray(value.content)) {
          console.log(`Found ${value.content.length} ${dataType} items in paginated response`);
          return value.content;
        }

        // Handle direct array response
        if (Array.isArray(value)) {
          console.log(`Found ${value.length} ${dataType} items in direct array`);
          return value;
        }

        console.warn(`Unexpected ${dataType} response format:`, value);
        return [];
      };

      const newTableData = {
        orders: extractData(orders, 'orders'),
        products: extractData(products, 'products'),
        users: extractData(users, 'users'),
        categories: extractData(categories, 'categories'),
        units: extractData(units, 'units'),
        departments: extractData(departments, 'departments'),
      };

      console.log('✅ Dashboard: Final table data:', newTableData);
      setTableData(newTableData);
    } catch (error) {
      console.error("Failed to fetch table data:", error);
      setError(error);
      toast.error("Failed to fetch dashboard data");
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchTableData();
      setLoading(false);
    };
    loadData();
  }, [fetchTableData]);

  // Enhanced refresh function
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchTableData();
      setLastRefresh(new Date());
      toast.success("Dashboard refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh dashboard");
    } finally {
      setRefreshing(false);
    }
  }, [fetchTableData]);

  // Computed metrics with enhanced data
  const keyMetrics = useMemo(() => {
    const orderStatusCounts = tableData.orders.reduce((acc, order) => {
      const status = order.status?.toLowerCase() || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    const activeProducts = tableData.products.filter(p => !p.status || p.status === 'active').length;
    const totalProducts = tableData.products.length;
    const pendingOrders = orderStatusCounts.pending || 0;
    
    return [
      {
        title: "Pending Orders",
        value: pendingOrders,
        trend: pendingOrders > 0 ? "up" : null,
        trendValue: pendingOrders > 0 ? `${pendingOrders} pending` : "All clear",
        icon: AssignmentIcon,
        color: "warning",
        route: "/order-management",
        subtitle: `${orderStatusCounts.approved || 0} approved this month`
      },
      {
        title: "Total Products",
        value: totalProducts,
        trend: activeProducts === totalProducts ? "up" : null,
        trendValue: `${Math.round((activeProducts/totalProducts)*100)}% active`,
        icon: InventoryIcon,
        color: "success",
        route: "/product-management",
        subtitle: `${tableData.categories.length} categories available`
      },
      {
        title: "System Users",
        value: tableData.users.length || 0,
        trend: "up",
        trendValue: "+12% this month",
        icon: PeopleIcon,
        color: "info",
        route: "/user-management",
        subtitle: `${tableData.departments.length} departments active`
      },
      {
        title: "Categories",
        value: tableData.categories.length || 0,
        trend: null,
        trendValue: null,
        icon: CategoryIcon,
        color: "primary",
        route: "/category-management",
        subtitle: `${tableData.units.length} units configured`
      },
    ];
  }, [tableData]);

  // Enhanced quick actions
  const quickActions = useMemo(() => {
    const pendingOrders = tableData.orders.filter(o => o.status?.toLowerCase() === 'pending').length;
    
    return [
      {
        title: "Review Orders",
        description: "Process pending orders",
        icon: AssignmentIcon,
        color: "warning",
        badge: pendingOrders,
        onClick: () => navigate("/order-management"),
      },
      {
        title: "Add Product",
        description: "Add new inventory item",
        icon: InventoryIcon,
        color: "success",
        onClick: () => navigate("/product-management"),
      },
      {
        title: "Manage Users",
        description: "User administration",
        icon: PeopleIcon,
        color: "info",
        onClick: () => navigate("/user-management"),
      },
      {
        title: "Categories",
        description: "Organize products",
        icon: CategoryIcon,
        color: "primary",
        onClick: () => navigate("/category-management"),
      },
      {
        title: "View Reports",
        description: "Analytics & insights",
        icon: TrendingUpIcon,
        color: "secondary",
        onClick: () => navigate("/reports"),
      },
      {
        title: "System Status",
        description: "Monitor health",
        icon: CheckCircleIcon,
        color: "success",
        onClick: () => {},
      },
    ];
  }, [tableData, navigate]);

  // Analytics data for progress bars
  const departmentAnalytics = useMemo(() => {
    const departmentMap = tableData.orders.reduce((acc, order) => {
      const dept = order.departmentName || order.department?.name || 'Unknown';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});

    const total = Object.values(departmentMap).reduce((sum, count) => sum + count, 0);
    
    return Object.entries(departmentMap)
      .map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? (value / total) * 100 : 0,
        subtitle: `${value} orders`
      }))
      .sort((a, b) => b.value - a.value);
  }, [tableData.orders]);

  const productAnalytics = useMemo(() => {
    const categoryMap = {};
    
    // Initialize with actual categories
    tableData.categories.forEach(cat => {
      const categoryName = cat.categoryName || cat.name || `Category ${cat.categoryId || cat.id}`;
      categoryMap[categoryName] = 0;
    });
    
    // Count products by category
    tableData.products.forEach(product => {
      const categoryName = product.categoryName || product.category?.name || "Uncategorized";
      categoryMap[categoryName] = (categoryMap[categoryName] || 0) + 1;
    });

    const total = Object.values(categoryMap).reduce((sum, count) => sum + count, 0);

    return Object.entries(categoryMap)
      .filter(([_, count]) => count > 0)
      .map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? (value / total) * 100 : 0,
        subtitle: `${value} products`
      }))
      .sort((a, b) => b.value - a.value);
  }, [tableData.categories, tableData.products]);

  // Smart insights generation
  const insights = useMemo(() => {
    const insights = [];
    
    if (departmentAnalytics.length > 0) {
      const topDept = departmentAnalytics[0];
      if (topDept.percentage > 40) {
        insights.push({
          type: 'warning',
          title: 'High Department Concentration',
          message: `${topDept.name} accounts for ${topDept.percentage.toFixed(1)}% of all orders`,
          icon: WarningIcon,
          color: 'warning'
        });
      }
    }

    if (tableData.orders.filter(o => o.status?.toLowerCase() === 'pending').length > 5) {
      insights.push({
        type: 'info',
        title: 'Pending Orders Alert',
        message: 'Multiple orders awaiting approval',
        icon: InfoIcon,
        color: 'info'
      });
    }

    if (productAnalytics.length >= 5) {
      insights.push({
        type: 'success',
        title: 'Good Product Distribution',
        message: `Products well distributed across ${productAnalytics.length} categories`,
        icon: CheckCircleIcon,
        color: 'success'
      });
    }

    if (tableData.users.length > 10) {
      insights.push({
        type: 'success',
        title: 'Active User Base',
        message: `${tableData.users.length} users actively using the system`,
        icon: StarIcon,
        color: 'success'
      });
    }

    return insights.slice(0, 4);
  }, [departmentAnalytics, productAnalytics, tableData]);

  // Recent activities with proper data mapping
  const recentActivities = useMemo(() => {
    const activities = [];
    
    // Add recent orders with proper data handling
    tableData.orders.slice(0, 5).forEach(order => {
      if (order.orderId && order.status) {
        activities.push({
          type: "order",
          description: `Order #${order.orderId} ${order.status}`,
          user: order.departmentName || order.department?.name || "Unknown Department",
          time: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "Recently",
        });
      }
    });
    
    // Add recent products with proper data handling
    tableData.products.slice(0, 3).forEach(product => {
      if (product.productName || product.name) {
        activities.push({
          type: "product",
          description: `Product "${product.productName || product.name}" updated`,
          user: "Admin",
          time: "Today",
        });
      }
    });
    
    return activities.sort(() => Math.random() - 0.5).slice(0, 8);
  }, [tableData]);

  // Enhanced chart data with better text handling
  const monthlyOrdersChart = useMemo(() => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthOrders = tableData.orders.filter(order => {
        if (!order.createdAt) return false;
        const orderDate = new Date(order.createdAt);
        return orderDate.getMonth() === date.getMonth() && orderDate.getFullYear() === date.getFullYear();
      }).length;
      
      months.push({
        label: date.toLocaleDateString('en-US', { month: 'short' }),
        count: monthOrders
      });
    }

    return {
      labels: months.map(m => m.label),
      datasets: {
        label: "Orders",
        data: months.map(m => m.count),
        color: theme.palette.primary.main,
      },
    };
  }, [tableData.orders, theme.palette.primary.main]);

  const categoryDistributionChart = useMemo(() => {
    // Limit category names to prevent overflow
    const categoryData = productAnalytics.slice(0, 5).map(item => ({
      name: item.name.length > 12 ? item.name.substring(0, 12) + '...' : item.name,
      count: item.value
    }));

    return {
      labels: categoryData.map(c => c.name),
      datasets: {
        label: "Products",
        data: categoryData.map(c => c.count),
        backgroundColor: [
          theme.palette.primary.main,
          theme.palette.success.main,
          theme.palette.warning.main,
          theme.palette.error.main,
          theme.palette.info.main,
        ],
      },
    };
  }, [productAnalytics, theme.palette]);

  if (loading) {
    return (
      <AdminLayout titleKey="adminDashboard" icon="dashboard">
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 2 }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
            Loading dashboard...
          </Typography>
          <LinearProgress sx={{ width: 300, mt: 2 }} />
        </Box>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout titleKey="adminDashboard" icon="dashboard">
        <Alert 
          severity="error" 
          sx={{ m: 3, borderRadius: 2 }}
          action={<MDButton onClick={handleRefresh} size="small">Retry</MDButton>}
        >
          <Typography variant="h6" gutterBottom>Dashboard Error</Typography>
          <Typography variant="body2">{error?.message || "Failed to load dashboard"}</Typography>
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout titleKey="adminDashboard" icon="dashboard">
      {/* Enhanced Welcome Header */}
      <WelcomeHeader 
        lastRefresh={lastRefresh}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      {/* Enhanced Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {keyMetrics.map((metric, index) => (
          <Grid key={index} item xs={12} sm={6} lg={3}>
            <EnhancedMetricCard {...metric} loading={false} />
          </Grid>
        ))}
      </Grid>

      {/* Enhanced Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          {quickActions.map((action, index) => (
            <Grid key={index} item xs={12} sm={6} md={4} lg={2}>
              <EnhancedQuickActionCard {...action} loading={false} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Analytics Section with Progress Bars */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
          Analytics Overview
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <ProgressBarAnalytics 
              data={departmentAnalytics}
              title="Top Departments"
              color="primary"
              icon={BusinessIcon}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <ProgressBarAnalytics 
              data={productAnalytics}
              title="Product Categories"
              color="success"
              icon={CategoryIcon}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={2} sx={{ borderRadius: 3, height: '100%' }}>
              <Box sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                  <Avatar sx={{ bgcolor: 'info.main', width: 40, height: 40 }}>
                    <InfoIcon fontSize="small" />
                  </Avatar>
                  <Typography variant="h6" fontWeight="600">
                    Smart Insights
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {insights.length > 0 ? insights.map((insight, index) => (
                    <InsightCard key={index} insight={insight} />
                  )) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <InfoIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                      <Typography variant="body2" color="textSecondary">
                        No insights available
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Enhanced Charts Section - Full Width */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
          Performance Charts
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ p: 3, borderRadius: 3, height: 450 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon sx={{ color: theme.palette.primary.main }} />
                Order Trends (Last 6 Months)
              </Typography>
              <Box sx={{ height: 350, mt: 2 }}>
                <ReportsLineChart
                  color="info"
                  title=""
                  description=""
                  date={`Updated: ${new Date().toLocaleDateString()}`}
                  chart={monthlyOrdersChart}
                />
              </Box>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ p: 3, borderRadius: 3, height: 450 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CategoryIcon sx={{ color: theme.palette.primary.main }} />
                Product Categories
              </Typography>
              <Box sx={{ height: 350, mt: 2 }}>
                <ReportsBarChart
                  color="success"
                  title=""
                  description=""
                  date={`Updated: ${new Date().toLocaleDateString()}`}
                  chart={categoryDistributionChart}
                />
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Enhanced Recent Activity */}
      <EnhancedRecentActivity activities={recentActivities} loading={false} />
    </AdminLayout>
  );
}