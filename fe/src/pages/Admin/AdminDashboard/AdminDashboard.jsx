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
  Tab,
  Tabs,
  Divider,
  Avatar,
  LinearProgress,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
  Schedule as ScheduleIcon,
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Assignment as AssignmentIcon,
  Category as CategoryIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

// Components
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import DataTable from "examples/Tables/DataTable";
import MDButton from "components/template/MDButton";
// Services
import { dashboardApi, orderApi, productApi, userApi, categoryApi, unitApi, departmentApi } from "services/api";

// Layout
import AdminLayout from "layouts/AdminLayout";

// Enhanced Components
import DashboardMetrics from "./components/DashboardMetrics";
import QuickActions from "./components/QuickActions";
import RecentActivity from "./components/RecentActivity";
import SystemStatus from "./components/SystemStatus";

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdminDashboard() {
  const { t } = useTranslation();
  const theme = useTheme();
  
  // Theme colors with fallbacks
  const primaryMain = theme?.palette?.primary?.main || '#1976d2';
  const primaryDark = theme?.palette?.primary?.dark || '#1565c0';
  const backgroundPaper = theme?.palette?.background?.paper || '#ffffff';
  const backgroundDefault = theme?.palette?.background?.default || '#fafafa';
  const textPrimary = theme?.palette?.text?.primary || '#000000';
  const textSecondary = theme?.palette?.text?.secondary || '#666666';

  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [tabValue, setTabValue] = useState(0);

  // Dashboard data state
  const [dashboardData, setDashboardData] = useState({
    overview: null,
    quickStats: null,
    departmentStats: null,
    orderStats: null,
    productStats: null,
    workflowStats: null,
    monthlyOrderSummary: [],
    topOrderedProducts: [],
    orderStatusDistribution: {},
    productCategoryDistribution: {},
  });

  // Table data state
  const [tableData, setTableData] = useState({
    orders: [],
    products: [],
    users: [],
    categories: [],
    units: [],
    departments: [],
  });

  // Enhanced data fetching - using actual table data for calculations
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Since the dashboard API endpoints might not exist, we'll calculate from actual data
      setDashboardData({
        overview: null,
        quickStats: null,
        departmentStats: null,
        orderStats: null,
        productStats: null,
        workflowStats: null,
        monthlyOrderSummary: [],
        topOrderedProducts: [],
        orderStatusDistribution: {},
        productCategoryDistribution: {},
      });

    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setError(error);
      toast.error(t("failedToFetchDashboardData") || "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  }, [t]);

  const fetchTableData = useCallback(async () => {
    try {
      const [orders, products, users, categories, units, departments] = await Promise.allSettled([
        orderApi.all(),
        productApi.all(),
        userApi.getUsers(),
        categoryApi.all(),
        unitApi.all(),
        departmentApi.all(),
      ]);

      setTableData({
        orders: orders.status === 'fulfilled' ? (Array.isArray(orders.value) ? orders.value : []) : [],
        products: products.status === 'fulfilled' ? (Array.isArray(products.value) ? products.value : []) : [],
        users: users.status === 'fulfilled' ? (Array.isArray(users.value) ? users.value : []) : [],
        categories: categories.status === 'fulfilled' ? (Array.isArray(categories.value) ? categories.value : []) : [],
        units: units.status === 'fulfilled' ? (Array.isArray(units.value) ? units.value : []) : [],
        departments: departments.status === 'fulfilled' ? (Array.isArray(departments.value) ? departments.value : []) : [],
      });
    } catch (error) {
      console.error("Failed to fetch table data:", error);
      toast.error(t("failedToFetchTableData") || "Failed to fetch table data");
    }
  }, [t]);

  useEffect(() => {
    fetchDashboardData();
    fetchTableData();
  }, [fetchDashboardData, fetchTableData]);

  // Enhanced refresh function
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchDashboardData(), fetchTableData()]);
      setLastRefresh(new Date());
      toast.success(t("dataRefreshed") || "Data refreshed successfully");
    } catch (error) {
      toast.error(t("refreshFailed") || "Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  }, [fetchDashboardData, fetchTableData, t]);

  // Enhanced summary cards with proper order status counting
  const summaryCards = useMemo(() => {
    const { quickStats, orderStats, productStats, departmentStats } = dashboardData;
    
    // Count orders by status from the actual orders data
    const orderStatusCounts = tableData.orders.reduce((acc, order) => {
      const status = order.status?.toLowerCase() || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    return [
      {
        color: "warning",
        icon: "hourglass_top",
        title: t("pendingOrders") || "Pending Orders",
        count: orderStatusCounts.pending || 0,
        route: "/admin/order-management",
        percentage: {
          color: "warning",
          amount: `${Math.round((orderStatusCounts.pending || 0) / Math.max(tableData.orders.length, 1) * 100)}%`,
          label: t("ofTotal") || "of total",
        },
        trend: "up",
      },
      {
        color: "success",
        icon: "check_circle",
        title: t("approvedOrders") || "Approved Orders",
        count: orderStatusCounts.approved || 0,
        route: "/admin/order-management",
        percentage: {
          color: "success",
          amount: `${Math.round((orderStatusCounts.approved || 0) / Math.max(tableData.orders.length, 1) * 100)}%`,
          label: t("ofTotal") || "of total",
        },
        trend: "up",
      },
      {
        color: "info",
        icon: "inventory",
        title: t("totalProducts") || "Total Products",
        count: tableData.products.length || 0,
        route: "/admin/product-management",
        percentage: {
          color: "info",
          amount: `${tableData.products.filter(p => p.status === 'active').length || 0}`,
          label: t("active") || "active",
        },
      },
      {
        color: "primary",
        icon: "people",
        title: t("totalUsers") || "Total Users",
        count: tableData.users.length || 0,
        route: "/admin/user-management",
        percentage: {
          color: "secondary",
          amount: `${tableData.categories.length || 0}`,
          label: t("categories") || "categories",
        },
      },
    ];
  }, [dashboardData, tableData, t]);

  // Computed data from actual table data
  const computedData = useMemo(() => {
    // Calculate order status distribution
    const orderStatusDistribution = tableData.orders.reduce((acc, order) => {
      const status = order.status?.toLowerCase() || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Create category mapping
    const categoryMap = tableData.categories?.reduce((acc, cat) => {
      acc[cat.categoryId || cat.id] = cat.categoryName || cat.name;
      return acc;
    }, {}) || {};

    // Calculate product category distribution
    const productCategoryDistribution = tableData.products.reduce((acc, product) => {
      // Products from API response don't have categoryId, they need to be mapped differently
      // For now, let's group by the 'unit' field or create categories based on product codes
      let category = 'Unknown Category';
      
      if (product.code) {
        // Group by first letter of product code
        const prefix = product.code.charAt(0);
        const categoryNames = {
          'B': 'Băng keo & Bìa',
          'C': 'Cắt & Chuốt',
          'D': 'Đồ dùng khác',
          'G': 'Giấy',
          'H': 'Hộp',
          'K': 'Kim & Kẹp',
          'M': 'Máy & Mực',
          'P': 'Pin',
          'R': 'Ruột chì',
          'S': 'Sổ',
          'T': 'Tập & Tem'
        };
        category = categoryNames[prefix] || `Nhóm ${prefix}`;
      }
      
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    // Get department name mapping
    const departmentMap = tableData.departments?.reduce((acc, dept) => {
      acc[dept.id] = dept.name;
      return acc;
    }, {}) || {};

    return {
      orderStatusDistribution,
      productCategoryDistribution,
      departmentMap,
    };
  }, [tableData]);

  // Chart data with computed data
  const monthlyOrdersChart = useMemo(() => {
    // Generate last 6 months data from orders
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        count: tableData.orders.filter(order => {
          if (!order.createdAt) return false;
          const orderDate = new Date(order.createdAt);
          return orderDate.getMonth() === date.getMonth() && orderDate.getFullYear() === date.getFullYear();
        }).length
      });
    }

    return {
      labels: months.map(m => m.label),
      datasets: {
        label: t("orders") || "Orders",
        data: months.map(m => m.count),
        color: primaryMain,
      },
    };
  }, [tableData.orders, t, primaryMain]);

  const topProductsChart = useMemo(() => {
    // Get top 5 categories by product count
    const categoryData = Object.entries(computedData.productCategoryDistribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    return {
      labels: categoryData.map(([category]) => category),
      datasets: {
        label: t("products") || "Products",
        data: categoryData.map(([,count]) => count),
        backgroundColor: primaryMain,
        borderColor: primaryDark,
        borderWidth: 2,
      },
    };
  }, [computedData.productCategoryDistribution, t, primaryMain, primaryDark]);

  // Table columns
  const getTableColumns = useCallback((type) => {
    const baseColumns = {
      orders: [
        { 
          Header: t("id") || "ID", 
          accessor: "orderId",
          Cell: ({ value }) => <Chip label={`#${value || 'N/A'}`} size="small" variant="outlined" color="primary" />
        },
        {
          Header: t("date") || "Date",
          accessor: "createdAt",
          Cell: ({ value }) => value ? new Date(value).toLocaleDateString() : "—"
        },
        { 
          Header: t("status") || "Status", 
          accessor: "status",
          Cell: ({ value }) => (
            <Chip 
              label={value || "Unknown"} 
              size="small" 
              color={
                value === "pending" ? "warning" :
                value === "approved" ? "success" :
                value === "rejected" ? "error" : "default"
              }
            />
          )
        },
        { 
          Header: t("department") || "Department", 
          accessor: "departmentName",
          Cell: ({ value }) => value || "—"
        },
      ],
      products: [
        { Header: t("id") || "ID", accessor: "productId" },
        { Header: t("name") || "Name", accessor: "productName" },
        { Header: t("category") || "Category", accessor: "categoryName" },
        { Header: t("unit") || "Unit", accessor: "unitName" },
        { 
          Header: t("status") || "Status", 
          accessor: "status",
          Cell: ({ value }) => (
            <Chip 
              label={value || "Active"} 
              size="small" 
              color={value === "active" ? "success" : "default"}
            />
          )
        },
      ],
      users: [
        { Header: t("id") || "ID", accessor: "id" },
        { Header: t("username") || "Username", accessor: "username" },
        { Header: t("email") || "Email", accessor: "email" },
        { Header: t("department") || "Department", accessor: "departmentName" },
        { 
          Header: t("role") || "Role", 
          accessor: "role",
          Cell: ({ value }) => (
            <Chip 
              label={value || "USER"} 
              size="small" 
              color={value === "ADMIN" ? "primary" : "default"}
            />
          )
        },
      ],
      categories: [
        { Header: t("id") || "ID", accessor: "categoryId" },
        { Header: t("name") || "Name", accessor: "categoryName" },
        { Header: t("description") || "Description", accessor: "description" },
        { 
          Header: t("products") || "Products", 
          accessor: "productCount",
          Cell: ({ value }) => value || 0
        },
      ],
      units: [
        { Header: t("id") || "ID", accessor: "id" },
        { Header: t("name") || "Name", accessor: "unitName" },
        { Header: t("description") || "Description", accessor: "description" },
      ],
    };

    return baseColumns[type] || [];
  }, [t]);

  if (loading) {
    return (
      <AdminLayout titleKey="adminDashboard" icon="dashboard">
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 2 }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ color: textSecondary }}>
            {t("loadingDashboard") || "Loading dashboard..."}
          </Typography>
          <LinearProgress sx={{ width: 200, mt: 2 }} />
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
          action={<MDButton onClick={handleRefresh} size="small">{t("retry") || "Retry"}</MDButton>}
        >
          <Typography variant="h6" gutterBottom>{t("dashboardError") || "Dashboard Error"}</Typography>
          <Typography variant="body2">{error?.message || JSON.stringify(error)}</Typography>
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout titleKey="adminDashboard" icon="dashboard">
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <DashboardIcon sx={{ color: primaryMain, fontSize: 32 }} />
            <Typography variant="h4" fontWeight="bold" sx={{ color: textPrimary }}>
              {t("adminDashboard") || "Admin Dashboard"}
            </Typography>
          </Box>
          
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Typography variant="caption" sx={{ color: textSecondary }}>
              {t("lastUpdated") || "Last updated"}: {lastRefresh.toLocaleTimeString()}
            </Typography>
            <Tooltip title={t("refresh") || "Refresh"}>
              <IconButton 
                onClick={handleRefresh} 
                disabled={refreshing}
                sx={{ 
                  bgcolor: alpha(primaryMain, 0.1),
                  "&:hover": { bgcolor: alpha(primaryMain, 0.2) }
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

        </Box>

      {/* Quick Actions */}
      <QuickActions />

      {/* Metrics Cards */}
      <DashboardMetrics cards={summaryCards} />

      {/* Main Content with Tabs */}
      <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: alpha(primaryMain, 0.05) }}>
          <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{ px: 2 }}
          >
            <Tab 
              icon={<AssessmentIcon />} 
              label={t("analytics") || "Analytics"} 
              iconPosition="start"
            />
            <Tab 
              icon={<AssignmentIcon />} 
              label={t("orders") || "Orders"} 
              iconPosition="start"
            />
            <Tab 
              icon={<InventoryIcon />} 
              label={t("products") || "Products"} 
              iconPosition="start"
            />
            <Tab 
              icon={<PeopleIcon />} 
              label={t("users") || "Users"} 
              iconPosition="start"
            />
            <Tab 
              icon={<ScheduleIcon />} 
              label={t("management") || "Management"} 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3} sx={{ p: 3 }}>
            <Grid xs={12} lg={8}>
              <Card elevation={1} sx={{ p: 3, borderRadius: 2, height: 'fit-content' }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <TrendingUpIcon sx={{ color: primaryMain }} />
                    {t("monthlyOrderTrends") || "Monthly Order Trends"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("orderTrendsDescription") || "Order trends over the last 6 months"}
                  </Typography>
                </Box>
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
            
            <Grid xs={12} lg={4}>
              <Card elevation={1} sx={{ p: 3, borderRadius: 2, height: 'fit-content' }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <AssessmentIcon sx={{ color: primaryMain }} />
                    {t("topProducts") || "Top Products"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("topProductsDescription") || "Most ordered products by category"}
                  </Typography>
                </Box>
                <Box sx={{ height: 300 }}>
                  <ReportsBarChart
                    color="success"
                    title=""
                    description=""
                    date={`Updated: ${new Date().toLocaleDateString()}`}
                    chart={topProductsChart}
                  />
                </Box>
              </Card>
            </Grid>

            {/* Order Status Distribution */}
            <Grid xs={12} md={6}>
              <Card elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {t("orderStatusDistribution") || "Order Status Distribution"}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {computedData.orderStatusDistribution && Object.keys(computedData.orderStatusDistribution).length > 0 ? (
                    Object.entries(computedData.orderStatusDistribution).map(([status, count], index) => {
                      const total = Object.values(computedData.orderStatusDistribution).reduce((a, b) => a + b, 0);
                      const percentage = Math.round((count / total) * 100);
                      const colors = ['#1976d2', '#2e7d32', '#ed6c02', '#d32f2f', '#7b1fa2'];
                      return (
                        <Box key={status} sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                              {status}
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {count} ({percentage}%)
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={percentage} 
                            sx={{ 
                              height: 8, 
                              borderRadius: 4,
                              bgcolor: alpha(colors[index % colors.length], 0.1),
                              '& .MuiLinearProgress-bar': {
                                bgcolor: colors[index % colors.length],
                                borderRadius: 4,
                              }
                            }}
                          />
                        </Box>
                      );
                    })
                  ) : (
                    <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                      {t("noDataAvailable") || "No data available"}
                    </Typography>
                  )}
                </Box>
              </Card>
            </Grid>

            {/* Product Category Distribution */}
            <Grid xs={12} md={6}>
              <Card elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {t("productCategoryDistribution") || "Product Category Distribution"}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {computedData.productCategoryDistribution && Object.keys(computedData.productCategoryDistribution).length > 0 ? (
                    Object.entries(computedData.productCategoryDistribution).map(([category, count], index) => {
                      const total = Object.values(computedData.productCategoryDistribution).reduce((a, b) => a + b, 0);
                      const percentage = Math.round((count / total) * 100);
                      const colors = ['#1976d2', '#2e7d32', '#ed6c02', '#d32f2f', '#7b1fa2'];
                      return (
                        <Box key={category} sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2">
                              {category}
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {count} ({percentage}%)
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={percentage} 
                            sx={{ 
                              height: 8, 
                              borderRadius: 4,
                              bgcolor: alpha(colors[index % colors.length], 0.1),
                              '& .MuiLinearProgress-bar': {
                                bgcolor: colors[index % colors.length],
                                borderRadius: 4,
                              }
                            }}
                            color="secondary"
                          />
                        </Box>
                      );
                    })
                  ) : (
                    <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                      {t("noDataAvailable") || "No data available"}
                    </Typography>
                  )}
                </Box>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Orders Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3} sx={{ p: 3 }}>
            {/* Order Status Pie Chart */}
            <Grid xs={12} md={5}>
              <Card elevation={1} sx={{ p: 3, borderRadius: 2, height: '400px' }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssignmentIcon sx={{ color: primaryMain }} />
                  {t("orderStatusDistribution") || "Order Status Distribution"}
                </Typography>
                <Box sx={{ mt: 2, height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {computedData.orderStatusDistribution && Object.keys(computedData.orderStatusDistribution).length > 0 ? (
                    <Box sx={{ width: '100%' }}>
                      {Object.entries(computedData.orderStatusDistribution).map(([status, count], index) => {
                        const total = Object.values(computedData.orderStatusDistribution).reduce((a, b) => a + b, 0);
                        const percentage = Math.round((count / total) * 100);
                        const colors = ['#1976d2', '#2e7d32', '#ed6c02', '#d32f2f', '#7b1fa2'];
                        return (
                          <Box key={status} sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" sx={{ textTransform: 'capitalize', fontWeight: 500 }}>
                                {status}
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {count} ({percentage}%)
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={percentage} 
                              sx={{ 
                                height: 12, 
                                borderRadius: 6,
                                bgcolor: alpha(colors[index % colors.length], 0.1),
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: colors[index % colors.length],
                                  borderRadius: 6,
                                }
                              }}
                            />
                          </Box>
                        );
                      })}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      {t("noDataAvailable") || "No data available"}
                    </Typography>
                  )}
                </Box>
              </Card>
            </Grid>

            {/* Recent Orders */}
            <Grid xs={12} md={7}>
              <Card elevation={1} sx={{ p: 3, borderRadius: 2, height: '400px' }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ScheduleIcon sx={{ color: primaryMain }} />
                  {t("recentOrders") || "Recent Orders"}
                </Typography>
                <Box sx={{ mt: 2, maxHeight: '300px', overflow: 'auto' }}>
                  {tableData.orders.slice(0, 8).map((order, index) => (
                    <Box key={order.orderId || index} sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      p: 1.5,
                      mb: 1,
                      borderRadius: 1,
                      bgcolor: alpha(primaryMain, 0.05),
                      border: '1px solid',
                      borderColor: alpha(primaryMain, 0.1)
                    }}>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          #{order.orderId || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {computedData.departmentMap[order.departmentId] || order.departmentName || 'Unknown Dept'}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Chip 
                          label={order.status || "Unknown"} 
                          size="small" 
                          color={
                            order.status === "pending" ? "warning" :
                            order.status === "approved" ? "success" :
                            order.status === "rejected" ? "error" : "default"
                          }
                        />
                        <Typography variant="caption" display="block" color="textSecondary">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Products Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3} sx={{ p: 3 }}>
            {/* Product Status Cards */}
            <Grid xs={12} md={4}>
              <Card elevation={1} sx={{ p: 3, borderRadius: 2, textAlign: 'center', bgcolor: alpha('#2e7d32', 0.05) }}>
                <InventoryIcon sx={{ fontSize: 48, color: '#2e7d32', mb: 2 }} />
                <Typography variant="h4" fontWeight="bold" color="#2e7d32">
                  {tableData.products.filter(p => p.status === 'active' || !p.status).length}
                </Typography>
                <Typography variant="h6" color="textSecondary">
                  {t("activeProducts") || "Active Products"}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  {Math.round((tableData.products.filter(p => p.status === 'active' || !p.status).length / Math.max(tableData.products.length, 1)) * 100)}% of total
                </Typography>
              </Card>
            </Grid>

            <Grid xs={12} md={4}>
              <Card elevation={1} sx={{ p: 3, borderRadius: 2, textAlign: 'center', bgcolor: alpha('#ed6c02', 0.05) }}>
                <InventoryIcon sx={{ fontSize: 48, color: '#ed6c02', mb: 2 }} />
                <Typography variant="h4" fontWeight="bold" color="#ed6c02">
                  {tableData.products.filter(p => p.status === 'inactive').length}
                </Typography>
                <Typography variant="h6" color="textSecondary">
                  {t("inactiveProducts") || "Inactive Products"}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  {Math.round((tableData.products.filter(p => p.status === 'inactive').length / Math.max(tableData.products.length, 1)) * 100)}% of total
                </Typography>
              </Card>
            </Grid>

            <Grid xs={12} md={4}>
              <Card elevation={1} sx={{ p: 3, borderRadius: 2, textAlign: 'center', bgcolor: alpha('#1976d2', 0.05) }}>
                <CategoryIcon sx={{ fontSize: 48, color: '#1976d2', mb: 2 }} />
                <Typography variant="h4" fontWeight="bold" color="#1976d2">
                  {tableData.categories.length}
                </Typography>
                <Typography variant="h6" color="textSecondary">
                  {t("totalCategories") || "Total Categories"}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  {Math.round(tableData.products.length / Math.max(tableData.categories.length, 1))} products per category
                </Typography>
              </Card>
            </Grid>

            {/* Product Category Distribution */}
            <Grid xs={12}>
              <Card elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InventoryIcon sx={{ color: primaryMain }} />
                  {t("productsByCategory") || "Products by Category"}
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {Object.entries(computedData.productCategoryDistribution).map(([categoryName, productCount], index) => {
                    const colors = ['#1976d2', '#2e7d32', '#ed6c02', '#d32f2f', '#7b1fa2', '#00796b', '#795548', '#607d8b'];
                    return (
                      <Grid xs={12} sm={6} md={3} key={categoryName}>
                        <Box sx={{ 
                          p: 2, 
                          borderRadius: 2, 
                          border: '1px solid',
                          borderColor: alpha(colors[index % colors.length], 0.3),
                          bgcolor: alpha(colors[index % colors.length], 0.05)
                        }}>
                          <Typography variant="subtitle2" fontWeight="medium" color={colors[index % colors.length]}>
                            {categoryName}
                          </Typography>
                          <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>
                            {productCount} {t("products") || "products"}
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={(productCount / Math.max(tableData.products.length, 1)) * 100} 
                            sx={{ 
                              mt: 1,
                              height: 6, 
                              borderRadius: 3,
                              bgcolor: alpha(colors[index % colors.length], 0.1),
                              '& .MuiLinearProgress-bar': {
                                bgcolor: colors[index % colors.length],
                                borderRadius: 3,
                              }
                            }}
                          />
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Users Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3} sx={{ p: 3 }}>
            {/* User Statistics Cards */}
            <Grid xs={12} md={4}>
              <Card elevation={1} sx={{ p: 3, borderRadius: 2, textAlign: 'center', bgcolor: alpha('#1976d2', 0.05) }}>
                <PeopleIcon sx={{ fontSize: 48, color: '#1976d2', mb: 2 }} />
                <Typography variant="h4" fontWeight="bold" color="#1976d2">
                  {tableData.users.length}
                </Typography>
                <Typography variant="h6" color="textSecondary">
                  {t("totalUsers") || "Total Users"}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  {t("registeredInSystem") || "Registered in system"}
                </Typography>
              </Card>
            </Grid>

            <Grid xs={12} md={4}>
              <Card elevation={1} sx={{ p: 3, borderRadius: 2, textAlign: 'center', bgcolor: alpha('#2e7d32', 0.05) }}>
                <AssignmentIcon sx={{ fontSize: 48, color: '#2e7d32', mb: 2 }} />
                <Typography variant="h4" fontWeight="bold" color="#2e7d32">
                  {new Set(tableData.orders.map(o => o.userId || o.createdBy)).size}
                </Typography>
                <Typography variant="h6" color="textSecondary">
                  {t("usersWithOrders") || "Users with Orders"}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  {Math.round((new Set(tableData.orders.map(o => o.userId || o.createdBy)).size / Math.max(tableData.users.length, 1)) * 100)}% of total users
                </Typography>
              </Card>
            </Grid>

            <Grid xs={12} md={4}>
              <Card elevation={1} sx={{ p: 3, borderRadius: 2, textAlign: 'center', bgcolor: alpha('#ed6c02', 0.05) }}>
                <PeopleIcon sx={{ fontSize: 48, color: '#ed6c02', mb: 2 }} />
                <Typography variant="h4" fontWeight="bold" color="#ed6c02">
                  {tableData.users.length - new Set(tableData.orders.map(o => o.userId || o.createdBy)).size}
                </Typography>
                <Typography variant="h6" color="textSecondary">
                  {t("usersWithoutOrders") || "Users without Orders"}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  {t("thisMonth") || "This month"}
                </Typography>
              </Card>
            </Grid>

            {/* User Roles Distribution */}
            <Grid xs={12} md={5}>
              <Card elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PeopleIcon sx={{ color: primaryMain }} />
                  {t("userRoles") || "User Roles"}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {['ADMIN', 'USER'].map((role, index) => {
                    const count = tableData.users.filter(u => u.role === role).length;
                    const colors = ['#1976d2', '#2e7d32'];
                    return (
                      <Box key={role} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" fontWeight="medium">
                            {role}
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {count}
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={count > 0 ? (count / Math.max(...['ADMIN', 'USER'].map(r => tableData.users.filter(u => u.role === r).length))) * 100 : 0} 
                          sx={{ 
                            height: 10, 
                            borderRadius: 5,
                            bgcolor: alpha(colors[index], 0.1),
                            '& .MuiLinearProgress-bar': {
                              bgcolor: colors[index],
                              borderRadius: 5,
                            }
                          }}
                        />
                      </Box>
                    );
                  })}
                </Box>
              </Card>
            </Grid>

            {/* Recent Users */}
            <Grid xs={12} md={7}>
              <Card elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PeopleIcon sx={{ color: primaryMain }} />
                  {t("recentUsers") || "Recent Users"}
                </Typography>
                <Box sx={{ mt: 2, maxHeight: '300px', overflow: 'auto' }}>
                  {tableData.users.slice(0, 6).map((user, index) => (
                    <Box key={user.id || index} sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      p: 1.5,
                      mb: 1,
                      borderRadius: 1,
                      bgcolor: alpha(primaryMain, 0.05),
                      border: '1px solid',
                      borderColor: alpha(primaryMain, 0.1)
                    }}>
                      <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: user.role === 'ADMIN' ? '#1976d2' : '#2e7d32' }}>
                        {user.username?.charAt(0)?.toUpperCase() || 'U'}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight="medium">
                          {user.username || 'Unknown User'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {user.email || 'No email'}
                        </Typography>
                      </Box>
                      <Chip 
                        label={user.role || 'USER'} 
                        size="small" 
                        color={user.role === 'ADMIN' ? 'primary' : 'default'}
                        variant={user.role === 'ADMIN' ? 'filled' : 'outlined'}
                      />
                    </Box>
                  ))}
                </Box>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Management Tab */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3} sx={{ p: 3 }}>
            {/* Summary Cards */}
            <Grid xs={12} md={4}>
              <Card elevation={1} sx={{ p: 3, borderRadius: 2, textAlign: 'center', bgcolor: alpha('#1976d2', 0.05) }}>
                <InventoryIcon sx={{ fontSize: 48, color: '#1976d2', mb: 2 }} />
                <Typography variant="h4" fontWeight="bold" color="#1976d2">
                  {tableData.products.length}
                </Typography>
                <Typography variant="h6" color="textSecondary">
                  {t("totalProducts") || "Total Products"}
                </Typography>
              </Card>
            </Grid>

            <Grid xs={12} md={4}>
              <Card elevation={1} sx={{ p: 3, borderRadius: 2, textAlign: 'center', bgcolor: alpha('#2e7d32', 0.05) }}>
                <CategoryIcon sx={{ fontSize: 48, color: '#2e7d32', mb: 2 }} />
                <Typography variant="h4" fontWeight="bold" color="#2e7d32">
                  {tableData.categories.length}
                </Typography>
                <Typography variant="h6" color="textSecondary">
                  {t("totalCategories") || "Total Categories"}
                </Typography>
              </Card>
            </Grid>

            <Grid xs={12} md={4}>
              <Card elevation={1} sx={{ p: 3, borderRadius: 2, textAlign: 'center', bgcolor: alpha('#ed6c02', 0.05) }}>
                <AssignmentIcon sx={{ fontSize: 48, color: '#ed6c02', mb: 2 }} />
                <Typography variant="h4" fontWeight="bold" color="#ed6c02">
                  {tableData.orders.length}
                </Typography>
                <Typography variant="h6" color="textSecondary">
                  {t("totalOrders") || "Total Orders"}
                </Typography>
              </Card>
            </Grid>

            {/* Management Overview Bar Chart */}
            <Grid xs={12} md={7}>
              <Card elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssessmentIcon sx={{ color: primaryMain }} />
                  {t("managementOverview") || "Management Overview"}
                </Typography>
                <Box sx={{ mt: 3 }}>
                  <ReportsBarChart
                    color="primary"
                    title=""
                    description={t("systemStatistics") || "System statistics overview"}
                    date={`Updated: ${new Date().toLocaleDateString()}`}
                    chart={{
                      labels: [
                        t("products") || "Products",
                        t("categories") || "Categories", 
                        t("orders") || "Orders",
                        t("users") || "Users",
                        t("units") || "Units"
                      ],
                      datasets: {
                        label: t("count") || "Count",
                        data: [
                          tableData.products.length,
                          tableData.categories.length,
                          tableData.orders.length,
                          tableData.users.length,
                          tableData.units.length
                        ],
                        backgroundColor: [
                          '#1976d2',
                          '#2e7d32', 
                          '#ed6c02',
                          '#7b1fa2',
                          '#00796b'
                        ],
                        borderColor: [
                          '#1565c0',
                          '#1b5e20',
                          '#e65100',
                          '#4a148c',
                          '#004d40'
                        ],
                        borderWidth: 2,
                      },
                    }}
                  />
                </Box>
              </Card>
            </Grid>

            {/* Quick Stats Summary */}
            <Grid xs={12} md={5}>
              <Card elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssessmentIcon sx={{ color: primaryMain }} />
                  {t("quickStats") || "Quick Stats"}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {[
                    { label: t("products") || "Products", value: tableData.products.length, color: '#1976d2' },
                    { label: t("categories") || "Categories", value: tableData.categories.length, color: '#2e7d32' },
                    { label: t("orders") || "Orders", value: tableData.orders.length, color: '#ed6c02' },
                    { label: t("users") || "Users", value: tableData.users.length, color: '#7b1fa2' },
                    { label: t("units") || "Units", value: tableData.units.length, color: '#00796b' },
                  ].map((stat, index) => (
                    <Box key={stat.label} sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      p: 1.5,
                      mb: 1,
                      borderRadius: 1,
                      bgcolor: alpha(stat.color, 0.05),
                      border: '1px solid',
                      borderColor: alpha(stat.color, 0.2)
                    }}>
                      <Typography variant="body2" fontWeight="medium" color={stat.color}>
                        {stat.label}
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color={stat.color}>
                        {stat.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* System Status */}
      <Box sx={{ mt: 3 }}>
        <SystemStatus />
      </Box>

      {/* Recent Activity */}
      <Box sx={{ mt: 3 }}>
        <Card elevation={2} sx={{ borderRadius: 3 }}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScheduleIcon sx={{ color: primaryMain }} />
              {t("recentActivity") || "Recent Activity"}
            </Typography>
            <Box sx={{ mt: 2 }}>
              {tableData.orders.slice(0, 8).map((order, index) => (
                <Box key={order.orderId || index} sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  p: 1,
                  mb: 0.5,
                  borderRadius: 1,
                  bgcolor: index % 2 === 0 ? alpha(primaryMain, 0.02) : 'transparent',
                  '&:hover': {
                    bgcolor: alpha(primaryMain, 0.05),
                  }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" fontWeight="medium">
                      #{order.orderId || 'N/A'}
                    </Typography>
                    <Chip 
                      label={order.status || "Unknown"} 
                      size="small" 
                      color={
                        order.status === "pending" ? "warning" :
                        order.status === "approved" ? "success" :
                        order.status === "rejected" ? "error" : "default"
                      }
                    />
                    <Typography variant="body2" color="textSecondary">
                      {order.adminComment || t("noComment") || "No comment"}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="textSecondary">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}
                  </Typography>
                </Box>
              ))}
              {tableData.orders.length === 0 && (
                <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                  {t("noRecentActivity") || "No recent activity"}
                </Typography>
              )}
            </Box>
          </Box>
        </Card>
      </Box>
    </AdminLayout>
  );
}
