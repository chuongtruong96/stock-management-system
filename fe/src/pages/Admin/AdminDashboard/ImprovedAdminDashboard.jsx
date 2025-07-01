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
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Assignment as AssignmentIcon,
  Category as CategoryIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
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

// Enhanced Welcome Header Component
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
        mb: 3, 
        borderRadius: 3,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha(theme.palette.primary.main, 0.15),
              color: theme.palette.primary.main,
            }}
          >
            <DashboardIcon fontSize="large" />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight="bold" sx={{ color: theme.palette.text.primary }}>
              👋 {greeting}, Admin!
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.5 }}>
              Here's what's happening in your system today
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              Last updated
            </Typography>
            <Typography variant="body2" fontWeight="medium" sx={{ color: theme.palette.text.primary }}>
              {lastRefresh.toLocaleTimeString()}
            </Typography>
          </Box>
          <Tooltip title="Refresh Dashboard">
            <IconButton 
              onClick={onRefresh} 
              disabled={refreshing}
              sx={{ 
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.2) }
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

// Enhanced Key Metrics Card Component
const MetricCard = ({ title, value, trend, trendValue, icon: Icon, color, route, loading }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  const getColor = (colorName) => {
    const colorMap = {
      primary: theme.palette.primary.main,
      success: theme.palette.success.main,
      warning: theme.palette.warning.main,
      error: theme.palette.error.main,
      info: theme.palette.info.main,
    };
    return colorMap[colorName] || theme.palette.primary.main;
  };
  
  const cardColor = getColor(color);
  const isPositiveTrend = trend === "up";
  
  const handleClick = () => {
    if (route) {
      navigate(route);
    }
  };
  
  if (loading) {
    return (
      <Card elevation={2} sx={{ p: 3, borderRadius: 3, height: 160 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Skeleton variant="rectangular" width={48} height={48} sx={{ borderRadius: 2 }} />
          <Skeleton variant="text" width={40} height={20} />
        </Box>
        <Skeleton variant="text" width="60%" height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="80%" height={20} />
      </Card>
    );
  }
  
  return (
    <Card
      elevation={2}
      onClick={handleClick}
      sx={{
        p: 3,
        borderRadius: 3,
        height: 160,
        background: `linear-gradient(135deg, ${alpha(cardColor, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
        border: `1px solid ${alpha(cardColor, 0.2)}`,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: route ? "pointer" : "default",
        "&:hover": route ? {
          transform: "translateY(-4px)",
          boxShadow: theme.shadows[8],
          border: `1px solid ${alpha(cardColor, 0.4)}`,
        } : {},
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
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
        {trend && trendValue && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {isPositiveTrend ? (
              <ArrowUpwardIcon sx={{ color: theme.palette.success.main, fontSize: 16 }} />
            ) : (
              <ArrowDownwardIcon sx={{ color: theme.palette.error.main, fontSize: 16 }} />
            )}
            <Typography 
              variant="caption" 
              fontWeight="bold"
              sx={{ color: isPositiveTrend ? theme.palette.success.main : theme.palette.error.main }}
            >
              {trendValue}
            </Typography>
          </Box>
        )}
      </Box>

      <Typography 
        variant="h4" 
        fontWeight="bold" 
        gutterBottom 
        sx={{ 
          color: theme.palette.text.primary,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }}
      >
        {typeof value === "number" ? value.toLocaleString() : value}
      </Typography>

      <Typography 
        variant="body2" 
        sx={{ 
          color: theme.palette.text.secondary,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }}
      >
        {title}
      </Typography>
    </Card>
  );
};

// Enhanced Quick Action Card Component
const QuickActionCard = ({ title, description, icon: Icon, color, onClick, badge, loading }) => {
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
      <Card elevation={1} sx={{ p: 2.5, borderRadius: 2, height: 120 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, height: "100%" }}>
          <Skeleton variant="rectangular" width={40} height={40} sx={{ borderRadius: 2 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="80%" height={20} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="60%" height={16} />
          </Box>
        </Box>
      </Card>
    );
  }
  
  return (
    <Card
      onClick={onClick}
      sx={{
        p: 2.5,
        borderRadius: 2,
        height: 120,
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        background: `linear-gradient(135deg, ${alpha(cardColor, 0.05)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
        border: `1px solid ${alpha(cardColor, 0.1)}`,
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: theme.shadows[4],
          border: `1px solid ${alpha(cardColor, 0.3)}`,
          background: `linear-gradient(135deg, ${alpha(cardColor, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, height: "100%" }}>
        <Box sx={{ position: "relative" }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha(cardColor, 0.15),
              color: cardColor,
            }}
          >
            <Icon fontSize="small" />
          </Box>
          {badge && badge > 0 && (
            <Box
              sx={{
                position: "absolute",
                top: -8,
                right: -8,
                minWidth: 20,
                height: 20,
                borderRadius: "50%",
                bgcolor: theme.palette.error.main,
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                fontWeight: "bold",
              }}
            >
              {badge > 99 ? "99+" : badge}
            </Box>
          )}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography 
            variant="subtitle2" 
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
            variant="caption" 
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

// Recent Activity Component
const RecentActivity = ({ activities, loading }) => {
  const theme = useTheme();
  
  if (loading) {
    return (
      <Card elevation={2} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom>Recent Activity</Typography>
        {[...Array(5)].map((_, index) => (
          <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Skeleton variant="circular" width={32} height={32} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="70%" height={16} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="40%" height={14} />
            </Box>
            <Skeleton variant="text" width={60} height={14} />
          </Box>
        ))}
      </Card>
    );
  }
  
  return (
    <Card elevation={2} sx={{ p: 3, borderRadius: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ScheduleIcon sx={{ color: theme.palette.primary.main }} />
          Recent Activity
        </Typography>
        <MDButton variant="text" size="small">
          View All
        </MDButton>
      </Box>
      
      <Box sx={{ maxHeight: 300, overflow: "auto" }}>
        {activities && activities.length > 0 ? activities.slice(0, 8).map((activity, index) => (
          <Box 
            key={index}
            sx={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              p: 1.5,
              mb: 1,
              borderRadius: 1,
              bgcolor: index % 2 === 0 ? alpha(theme.palette.primary.main, 0.02) : "transparent",
              "&:hover": {
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              }
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main, fontSize: "0.875rem" }}>
                {activity.type === "order" ? "📋" : activity.type === "product" ? "📦" : "👤"}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography 
                  variant="body2" 
                  fontWeight="medium"
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
          <Typography variant="body2" color="textSecondary" sx={{ textAlign: "center", py: 4 }}>
            No recent activity
          </Typography>
        )}
      </Box>
    </Card>
  );
};

// Main Improved AdminDashboard Component
export default function ImprovedAdminDashboard() {
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

  // Computed metrics with proper data handling
  const keyMetrics = useMemo(() => {
    const orderStatusCounts = tableData.orders.reduce((acc, order) => {
      const status = order.status?.toLowerCase() || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    const activeProducts = tableData.products.filter(p => !p.status || p.status === 'active').length;
    const totalProducts = tableData.products.length;
    
    return [
      {
        title: "Pending Orders",
        value: orderStatusCounts.pending || 0,
        trend: orderStatusCounts.pending > 0 ? "up" : null,
        trendValue: orderStatusCounts.pending > 0 ? `${orderStatusCounts.pending} pending` : null,
        icon: AssignmentIcon,
        color: "warning",
        route: "/order-management",
      },
      {
        title: "Total Products",
        value: totalProducts,
        trend: activeProducts === totalProducts ? "up" : null,
        trendValue: `${activeProducts} active`,
        icon: InventoryIcon,
        color: "success",
        route: "/product-management",
      },
      {
        title: "System Users",
        value: tableData.users.length || 0,
        trend: null,
        trendValue: null,
        icon: PeopleIcon,
        color: "info",
        route: "/user-management",
      },
      {
        title: "Categories",
        value: tableData.categories.length || 0,
        trend: null,
        trendValue: `${tableData.units.length} units`,
        icon: CategoryIcon,
        color: "primary",
        route: "/category-management",
      },
    ];
  }, [tableData]);

  // Quick actions with proper navigation
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

  // Chart data with proper data handling
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
    // Create a map of category names to product counts
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

    const categoryData = Object.entries(categoryMap)
      .filter(([_, count]) => count > 0)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

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
  }, [tableData.categories, tableData.products, theme.palette]);

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
      {/* Welcome Header */}
      <WelcomeHeader 
        lastRefresh={lastRefresh}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {keyMetrics.map((metric, index) => (
          <Grid key={index} item xs={12} sm={6} lg={3}>
            <MetricCard {...metric} loading={false} />
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          {quickActions.map((action, index) => (
            <Grid key={index} item xs={12} sm={6} md={4} lg={2}>
              <QuickActionCard {...action} loading={false} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Card elevation={2} sx={{ p: 3, borderRadius: 3, height: 400 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon sx={{ color: theme.palette.primary.main }} />
              Order Trends (Last 6 Months)
            </Typography>
            <Box sx={{ height: 300 }}>
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
        
        <Grid item xs={12} lg={4}>
          <Card elevation={2} sx={{ p: 3, borderRadius: 3, height: 400 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CategoryIcon sx={{ color: theme.palette.primary.main }} />
              Product Categories
            </Typography>
            <Box sx={{ height: 300 }}>
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

      {/* Recent Activity */}
      <RecentActivity activities={recentActivities} loading={false} />
    </AdminLayout>
  );
}