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
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

// Components
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import DataTable from "examples/Tables/DataTable";
import MDButton from "components/template/MDButton";

// Services
import { dashboardApi, orderApi, productApi, userApi, categoryApi, unitApi } from "services/api";

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

export default function EnhancedAdminDashboard() {
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
  });

  // Enhanced data fetching
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        overview,
        quickStats,
        departmentStats,
        orderStats,
        productStats,
        workflowStats,
        monthlyOrderSummary,
        topOrderedProducts,
        orderStatusDistribution,
        productCategoryDistribution,
      ] = await Promise.allSettled([
        dashboardApi.getOverview(),
        dashboardApi.getQuickStats(),
        dashboardApi.getDepartmentStats(),
        dashboardApi.getCurrentMonthOrderStats(),
        dashboardApi.getProductStats(),
        dashboardApi.getWorkflowStats(),
        dashboardApi.getMonthlyOrderSummary(12),
        dashboardApi.getTopOrderedProducts(10),
        dashboardApi.getOrderStatusDistribution(),
        dashboardApi.getProductCategoryDistribution(),
      ]);

      setDashboardData({
        overview: overview.status === 'fulfilled' ? overview.value : null,
        quickStats: quickStats.status === 'fulfilled' ? quickStats.value : null,
        departmentStats: departmentStats.status === 'fulfilled' ? departmentStats.value : null,
        orderStats: orderStats.status === 'fulfilled' ? orderStats.value : null,
        productStats: productStats.status === 'fulfilled' ? productStats.value : null,
        workflowStats: workflowStats.status === 'fulfilled' ? workflowStats.value : null,
        monthlyOrderSummary: monthlyOrderSummary.status === 'fulfilled' ? monthlyOrderSummary.value : [],
        topOrderedProducts: topOrderedProducts.status === 'fulfilled' ? topOrderedProducts.value : [],
        orderStatusDistribution: orderStatusDistribution.status === 'fulfilled' ? orderStatusDistribution.value : {},
        productCategoryDistribution: productCategoryDistribution.status === 'fulfilled' ? productCategoryDistribution.value : {},
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
      const [orders, products, users, categories, units] = await Promise.allSettled([
        orderApi.all(),
        productApi.all(),
        userApi.getUsers(),
        categoryApi.all(),
        unitApi.all(),
      ]);

      setTableData({
        orders: orders.status === 'fulfilled' ? orders.value : [],
        products: products.status === 'fulfilled' ? products.value : [],
        users: users.status === 'fulfilled' ? users.value : [],
        categories: categories.status === 'fulfilled' ? categories.value : [],
        units: units.status === 'fulfilled' ? units.value : [],
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

  // Enhanced summary cards
  const summaryCards = useMemo(() => {
    const { quickStats, orderStats, productStats, departmentStats } = dashboardData;
    
    return [
      {
        color: "error",
        icon: "hourglass_top",
        title: t("pendingOrders") || "Pending Orders",
        count: quickStats?.pendingOrdersCount || 0,
        route: "/admin/order-management",
        percentage: {
          color: "warning",
          amount: `${orderStats?.pendingOrdersCount || 0}`,
          label: t("thisMonth") || "this month",
        },
        trend: "up",
      },
      {
        color: "info",
        icon: "assignment",
        title: t("submittedOrders") || "Submitted Orders",
        count: quickStats?.submittedOrdersCount || 0,
        route: "/admin/order-management",
        percentage: {
          color: "success",
          amount: `${orderStats?.submittedOrdersCount || 0}`,
          label: t("thisMonth") || "this month",
        },
        trend: "up",
      },
      {
        color: "success",
        icon: "inventory",
        title: t("totalProducts") || "Total Products",
        count: quickStats?.totalProductsCount || 0,
        route: "/admin/product-management",
        percentage: {
          color: "info",
          amount: `${productStats?.totalCategories || 0}`,
          label: t("categories") || "categories",
        },
      },
      {
        color: "primary",
        icon: "people",
        title: t("totalUsers") || "Total Users",
        count: quickStats?.totalUsersCount || 0,
        route: "/admin/user-management",
        percentage: {
          color: "secondary",
          amount: `${departmentStats?.totalDepartments || 0}`,
          label: t("departments") || "departments",
        },
      },
    ];
  }, [dashboardData, t]);

  // Chart data
  const monthlyOrdersChart = useMemo(() => ({
    labels: dashboardData.monthlyOrderSummary.map(item => 
      new Date(item.year, item.month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    ),
    datasets: {
      label: t("orders") || "Orders",
      data: dashboardData.monthlyOrderSummary.map(item => item.totalOrders || 0),
      color: primaryMain,
    },
  }), [dashboardData.monthlyOrderSummary, t, primaryMain]);

  const topProductsChart = useMemo(() => ({
    labels: dashboardData.topOrderedProducts.map(p => p.productName || p.name || 'Unknown'),
    datasets: {
      label: t("orderedQty") || "Ordered Qty",
      data: dashboardData.topOrderedProducts.map(p => p.totalQuantity || p.quantity || 0),
      backgroundColor: primaryMain,
      borderColor: primaryDark,
      borderWidth: 2,
    },
  }), [dashboardData.topOrderedProducts, t, primaryMain, primaryDark]);

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
      <AdminLayout titleKey="enhancedDashboard" icon="dashboard">
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 2 }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ color: textSecondary }}>
            {t("loadingDashboard") || "Loading enhanced dashboard..."}
          </Typography>
          <LinearProgress sx={{ width: 200, mt: 2 }} />
        </Box>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout titleKey="enhancedDashboard" icon="dashboard">
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
    <AdminLayout titleKey="enhancedDashboard" icon="dashboard">
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <DashboardIcon sx={{ color: primaryMain, fontSize: 32 }} />
            <Typography variant="h4" fontWeight="bold" sx={{ color: textPrimary }}>
              {t("enhancedDashboard") || "Enhanced Dashboard"}
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

        {/* System Status */}
        <SystemStatus />
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
            <Grid item xs={12} lg={8}>
              <Card elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUpIcon sx={{ color: primaryMain }} />
                  {t("monthlyOrderTrends") || "Monthly Order Trends"}
                </Typography>
                <ReportsLineChart
                  color="info"
                  title=""
                  description={t("orderTrendsDescription") || "Order trends over the last 12 months"}
                  date={new Date().toLocaleDateString()}
                  chart={monthlyOrdersChart}
                />
              </Card>
            </Grid>
            
            <Grid item xs={12} lg={4}>
              <Card elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssessmentIcon sx={{ color: primaryMain }} />
                  {t("topProducts") || "Top Products"}
                </Typography>
                <ReportsBarChart
                  color="success"
                  title=""
                  description={t("topProductsDescription") || "Most ordered products"}
                  date={new Date().toLocaleDateString()}
                  chart={topProductsChart}
                />
              </Card>
            </Grid>

            {/* Order Status Distribution */}
            <Grid item xs={12} md={6}>
              <Card elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {t("orderStatusDistribution") || "Order Status Distribution"}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {Object.entries(dashboardData.orderStatusDistribution).map(([status, count]) => (
                    <Box key={status} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {status}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {count}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(count / Math.max(...Object.values(dashboardData.orderStatusDistribution))) * 100} 
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  ))}
                </Box>
              </Card>
            </Grid>

            {/* Product Category Distribution */}
            <Grid item xs={12} md={6}>
              <Card elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {t("productCategoryDistribution") || "Product Category Distribution"}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {Object.entries(dashboardData.productCategoryDistribution).map(([category, count]) => (
                    <Box key={category} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">
                          {category}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {count}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(count / Math.max(...Object.values(dashboardData.productCategoryDistribution))) * 100} 
                        sx={{ height: 8, borderRadius: 4 }}
                        color="secondary"
                      />
                    </Box>
                  ))}
                </Box>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Orders Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            <DataTable
              table={{ 
                columns: getTableColumns('orders'), 
                rows: tableData.orders.slice(0, 50) 
              }}
              canSearch={true}
              entriesPerPage={{ defaultValue: 10, entries: [5, 10, 25, 50] }}
              showTotalEntries={true}
              isSorted={true}
            />
          </Box>
        </TabPanel>

        {/* Products Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3 }}>
            <DataTable
              table={{ 
                columns: getTableColumns('products'), 
                rows: tableData.products.slice(0, 50) 
              }}
              canSearch={true}
              entriesPerPage={{ defaultValue: 10, entries: [5, 10, 25, 50] }}
              showTotalEntries={true}
              isSorted={true}
            />
          </Box>
        </TabPanel>

        {/* Users Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ p: 3 }}>
            <DataTable
              table={{ 
                columns: getTableColumns('users'), 
                rows: tableData.users.slice(0, 50) 
              }}
              canSearch={true}
              entriesPerPage={{ defaultValue: 10, entries: [5, 10, 25, 50] }}
              showTotalEntries={true}
              isSorted={true}
            />
          </Box>
        </TabPanel>

        {/* Management Tab */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3} sx={{ p: 3 }}>
            <Grid item xs={12} md={6}>
              <Card elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {t("categories") || "Categories"}
                </Typography>
                <DataTable
                  table={{ 
                    columns: getTableColumns('categories'), 
                    rows: tableData.categories 
                  }}
                  canSearch={true}
                  entriesPerPage={{ defaultValue: 5, entries: [5, 10] }}
                  showTotalEntries={false}
                  isSorted={true}
                />
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {t("units") || "Units"}
                </Typography>
                <DataTable
                  table={{ 
                    columns: getTableColumns('units'), 
                    rows: tableData.units 
                  }}
                  canSearch={true}
                  entriesPerPage={{ defaultValue: 5, entries: [5, 10] }}
                  showTotalEntries={false}
                  isSorted={true}
                />
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Recent Activity */}
      <Box sx={{ mt: 3 }}>
        <RecentActivity orders={tableData.orders.slice(0, 5)} />
      </Box>
    </AdminLayout>
  );
}