import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  Tabs,
  Tab,
  Fade,
  LinearProgress,
  Switch,
  FormControlLabel,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import {
  Analytics as AnalyticsIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
  TableChart as TableIcon,
  FilterList as FilterIcon,
  Dashboard as DashboardIcon,
  BarChart as ChartIcon,
  ViewModule as ViewIcon,
  TrendingUp as TrendingUpIcon,
  Compare as CompareIcon,
  Category as CategoryIcon,
  Speed as PerformanceIcon,
  Business as DepartmentIcon,
  DateRange as DateRangeIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import AdminLayout from "layouts/AdminLayout";
import LanguageToggle from "components/common/LanguageToggle";
import { DatePresets, ExportManager, ResponsiveContainer } from "./components";
import AdvancedFilters from "./components/AdvancedFilters";
import { reportApi } from "services/api";

export default function Phase2Reports() {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(false);
  
  // Date state
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  
  // Phase 2 data state
  const [phase2Data, setPhase2Data] = useState({
    enhancedCategories: null,
    departmentPreferences: null,
    systemHealth: null,
    filteredAnalytics: null,
    customDateRange: null,
  });
  
  const [filters, setFilters] = useState({});
  const [savedFilters, setSavedFilters] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch Phase 2 enhanced data
  const fetchPhase2Data = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📊 Phase 2 Reports: Fetching enhanced data...');
      
      const [enhancedCategories, departmentPreferences, systemHealth] = await Promise.all([
        reportApi.getEnhancedCategoryDistribution(year, month).catch(err => {
          console.warn('Enhanced categories failed:', err);
          return null;
        }),
        reportApi.getDepartmentCategoryPreferences(year, month).catch(err => {
          console.warn('Department preferences failed:', err);
          return null;
        }),
        reportApi.getSystemHealthMetrics().catch(err => {
          console.warn('System health failed:', err);
          return null;
        }),
      ]);
      
      setPhase2Data({
        enhancedCategories,
        departmentPreferences,
        systemHealth,
        filteredAnalytics: null,
        customDateRange: null,
      });
      
      setLastUpdated(new Date().toISOString());
      console.log('📊 Phase 2 Reports: Data loaded successfully');
      
      if (enhancedCategories || departmentPreferences || systemHealth) {
        toast.success(t("phase2DataLoaded") || "Phase 2 analytics loaded successfully");
      }
    } catch (error) {
      console.error('Failed to fetch Phase 2 data:', error);
      setError(error);
      toast.error('Some Phase 2 features may not be available');
    } finally {
      setLoading(false);
    }
  }, [year, month, t]);

  // Handle advanced filtering
  const handleFiltersChange = useCallback(async (newFilters) => {
    setFilters(newFilters);
    
    try {
      console.log('📊 Phase 2 Reports: Applying filters:', newFilters);
      const filteredAnalytics = await reportApi.getFilteredAnalytics(newFilters);
      setPhase2Data(prev => ({ ...prev, filteredAnalytics }));
      toast.success(t("filtersApplied") || "Filters applied successfully");
    } catch (error) {
      console.error('Failed to apply filters:', error);
      toast.error('Failed to apply filters');
    }
  }, [t]);

  // Handle custom date range
  const handleCustomDateRange = useCallback(async (startDate, endDate) => {
    try {
      console.log('📊 Phase 2 Reports: Custom date range:', { startDate, endDate });
      const customDateRange = await reportApi.getCustomDateRangeAnalytics(startDate, endDate);
      setPhase2Data(prev => ({ ...prev, customDateRange }));
      toast.success(t("customDateRangeApplied") || "Custom date range applied");
    } catch (error) {
      console.error('Failed to apply custom date range:', error);
      toast.error('Failed to apply custom date range');
    }
  }, [t]);

  // Save filter
  const handleSaveFilter = useCallback((filter) => {
    setSavedFilters(prev => [...prev, filter]);
    toast.success(t("filterSaved") || "Filter saved successfully");
  }, [t]);

  // Export functionality
  const handleExport = async (format) => {
    try {
      setExporting(true);
      const monthParam = `${year}-${String(month).padStart(2, '0')}`;
      
      let data;
      if (format === 'excel') {
        data = await reportApi.exportExcel(monthParam);
      } else if (format === 'pdf') {
        data = await reportApi.exportPdf(monthParam);
      } else {
        throw new Error(`Unsupported export format: ${format}`);
      }
      
      // Create download link
      const url = URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      const extension = format === 'excel' ? 'xlsx' : 'pdf';
      link.setAttribute("download", `phase2_report_${year}_${month}.${extension}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(t("exportSuccess") || "Export completed successfully");
    } catch (err) {
      console.error('❌ Phase 2 Reports: Export error:', err);
      const errorMessage = err.response?.data?.message || err.message || "Export failed";
      toast.error(errorMessage);
    } finally {
      setExporting(false);
    }
  };

  // Handle preset selection
  const handlePresetSelect = (selectedMonth, selectedYear) => {
    setMonth(selectedMonth);
    setYear(selectedYear);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Load data on component mount and when date changes
  useEffect(() => {
    fetchPhase2Data();
  }, [fetchPhase2Data]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      if (activeTab === 0) { // Only refresh on overview tab
        reportApi.getSystemHealthMetrics()
          .then(systemHealth => {
            setPhase2Data(prev => ({ ...prev, systemHealth }));
          })
          .catch(err => console.warn('Auto-refresh failed:', err));
      }
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [autoRefresh, activeTab]);

  // Tab configuration - Phase 2 enhanced
  const reportTabs = [
    {
      label: t('overview') || 'Overview',
      icon: DashboardIcon,
      value: 0
    },
    {
      label: t('enhancedCategories') || 'Enhanced Categories',
      icon: CategoryIcon,
      value: 1
    },
    {
      label: t('departmentAnalysis') || 'Department Analysis',
      icon: DepartmentIcon,
      value: 2
    },
    {
      label: t('advancedFiltering') || 'Advanced Filtering',
      icon: FilterIcon,
      value: 3
    },
    {
      label: t('systemHealth') || 'System Health',
      icon: PerformanceIcon,
      value: 4
    }
  ];

  // System health status
  const getHealthStatus = (health) => {
    if (!health) return { color: 'default', icon: WarningIcon, text: 'Unknown' };
    
    const performance = health.performanceMetrics?.systemStatus;
    if (performance === 'excellent') return { color: 'success', icon: CheckIcon, text: 'Excellent' };
    if (performance === 'good') return { color: 'info', icon: CheckIcon, text: 'Good' };
    return { color: 'warning', icon: WarningIcon, text: 'Needs Attention' };
  };

  const healthStatus = getHealthStatus(phase2Data.systemHealth);

  return (
    <AdminLayout titleKey="phase2Reports" icon="analytics">
      <ResponsiveContainer>
        {/* Header Section */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={3}
          sx={{ 
            p: 3, 
            borderRadius: 3, 
            bgcolor: 'background.paper',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
              <AnalyticsIcon sx={{ fontSize: '2rem' }} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {t("phase2ReportsAnalytics") || "Phase 2 Reports & Analytics"}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {t("phase2ReportsDescription") || "Advanced analytics with real categories, filtering, and performance monitoring"}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              icon={<healthStatus.icon />}
              label={`System: ${healthStatus.text}`}
              color={healthStatus.color}
              variant="outlined"
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  sx={{ 
                    '& .MuiSwitch-switchBase.Mui-checked': { color: 'white' },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: 'rgba(255,255,255,0.3)' }
                  }}
                />
              }
              label={t("autoRefresh") || "Auto Refresh"}
              sx={{ color: 'white', mr: 2 }}
            />
            <LanguageToggle size="small" sx={{ color: 'white' }} />
            <Tooltip title={t("refreshData") || "Refresh Data"}>
              <IconButton
                onClick={fetchPhase2Data}
                disabled={loading}
                sx={{ 
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                }}
              >
                <RefreshIcon className={loading ? 'animate-spin' : ''} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Navigation Tabs */}
        <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ p: 0 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                '& .MuiTab-root': {
                  minHeight: 72,
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '1rem',
                  px: 3,
                  py: 2
                },
                '& .MuiTabs-indicator': {
                  height: 3,
                  borderRadius: '3px 3px 0 0'
                }
              }}
            >
              {reportTabs.map((tab) => {
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
          </CardContent>
        </Card>

        {/* Tab Content */}
        <Box sx={{ mt: 3 }}>
          {/* Overview Tab */}
          {activeTab === 0 && (
            <Fade in={activeTab === 0} timeout={300}>
              <Box>
                {/* System Health Overview */}
                {phase2Data.systemHealth && (
                  <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight="600" gutterBottom>
                        {t("systemHealthOverview") || "System Health Overview"}
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={3}>
                          <Box textAlign="center">
                            <Typography variant="h4" color="primary.main" fontWeight="bold">
                              {phase2Data.systemHealth.systemMetrics?.totalOrders || 0}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {t("totalOrders") || "Total Orders"}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Box textAlign="center">
                            <Typography variant="h4" color="success.main" fontWeight="bold">
                              {phase2Data.systemHealth.performanceMetrics?.totalResponseTime || "N/A"}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {t("responseTime") || "Response Time"}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Box textAlign="center">
                            <Typography variant="h4" color="info.main" fontWeight="bold">
                              {phase2Data.systemHealth.memoryMetrics?.memoryUsagePercent || 0}%
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {t("memoryUsage") || "Memory Usage"}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <Box textAlign="center">
                            <Typography variant="h4" color="warning.main" fontWeight="bold">
                              {phase2Data.systemHealth.cacheMetrics?.estimatedCacheHitRate || "N/A"}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {t("cacheHitRate") || "Cache Hit Rate"}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                )}

                {/* Phase 2 Features Overview */}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight="600" gutterBottom>
                          {t("enhancedCategoriesPreview") || "Enhanced Categories"}
                        </Typography>
                        {phase2Data.enhancedCategories?.distribution ? (
                          <Box>
                            {phase2Data.enhancedCategories.distribution.slice(0, 3).map((category, index) => (
                              <Box key={category.name} sx={{ mb: 2 }}>
                                <Box display="flex" justifyContent="space-between" mb={1}>
                                  <Typography variant="body2" fontWeight="500">
                                    {category.name}
                                    {category.isRealCategory && (
                                      <Chip label="Real" size="small" color="success" sx={{ ml: 1 }} />
                                    )}
                                  </Typography>
                                  <Typography variant="body2" color="primary.main" fontWeight="600">
                                    {category.quantity} ({category.percentage}%)
                                  </Typography>
                                </Box>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={category.percentage}
                                  sx={{ height: 8, borderRadius: 4 }}
                                />
                              </Box>
                            ))}
                            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                              {phase2Data.enhancedCategories.summary?.realCategories || 0} real categories, {' '}
                              {phase2Data.enhancedCategories.summary?.inferredCategories || 0} inferred
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            {t("loadingEnhancedCategories") || "Loading enhanced categories..."}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight="600" gutterBottom>
                          {t("departmentPreferencesPreview") || "Department Preferences"}
                        </Typography>
                        {phase2Data.departmentPreferences?.departmentAnalysis ? (
                          <Box>
                            {phase2Data.departmentPreferences.departmentAnalysis.slice(0, 3).map((dept, index) => (
                              <Box key={dept.department} sx={{ mb: 2 }}>
                                <Box display="flex" justifyContent="space-between" mb={1}>
                                  <Typography variant="body2" fontWeight="500">
                                    {dept.department}
                                  </Typography>
                                  <Typography variant="body2" color="secondary.main" fontWeight="600">
                                    {dept.categoryCount} categories
                                  </Typography>
                                </Box>
                                <Typography variant="caption" color="textSecondary">
                                  Top: {dept.topCategory} • Diversity: {Math.round((dept.diversity || 0) * 100)}%
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            {t("loadingDepartmentPreferences") || "Loading department preferences..."}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </Fade>
          )}

          {/* Enhanced Categories Tab */}
          {activeTab === 1 && (
            <Fade in={activeTab === 1} timeout={300}>
              <Box>
                <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="600" gutterBottom>
                      {t("enhancedCategoryDistribution") || "Enhanced Category Distribution"}
                    </Typography>
                    {phase2Data.enhancedCategories?.distribution ? (
                      <Box>
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                          <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 2, textAlign: 'center' }}>
                              <Typography variant="h4" color="primary.main" fontWeight="bold">
                                {phase2Data.enhancedCategories.summary?.totalCategories || 0}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                Total Categories
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 2, textAlign: 'center' }}>
                              <Typography variant="h4" color="success.main" fontWeight="bold">
                                {phase2Data.enhancedCategories.summary?.realCategories || 0}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                Real Categories
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 2, textAlign: 'center' }}>
                              <Typography variant="h4" color="warning.main" fontWeight="bold">
                                {phase2Data.enhancedCategories.summary?.inferredCategories || 0}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                Inferred Categories
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 2, textAlign: 'center' }}>
                              <Typography variant="h4" color="info.main" fontWeight="bold">
                                {phase2Data.enhancedCategories.summary?.totalQuantity || 0}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                Total Quantity
                              </Typography>
                            </Paper>
                          </Grid>
                        </Grid>

                        <Box sx={{ mt: 3 }}>
                          {phase2Data.enhancedCategories.distribution.map((category, index) => (
                            <Box key={category.name} sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Typography variant="h6" fontWeight="500">
                                    {category.name}
                                  </Typography>
                                  <Chip 
                                    label={category.isRealCategory ? "Real" : "Inferred"}
                                    size="small"
                                    color={category.isRealCategory ? "success" : "warning"}
                                  />
                                  <Chip 
                                    label={category.code}
                                    size="small"
                                    variant="outlined"
                                  />
                                </Box>
                                <Typography variant="h6" color="primary.main" fontWeight="bold">
                                  {category.quantity} ({category.percentage}%)
                                </Typography>
                              </Box>
                              <LinearProgress 
                                variant="determinate" 
                                value={category.percentage}
                                sx={{ height: 12, borderRadius: 6, mb: 2 }}
                              />
                              <Grid container spacing={2}>
                                <Grid item xs={4}>
                                  <Typography variant="body2" color="textSecondary">
                                    Orders: {category.orderCount}
                                  </Typography>
                                </Grid>
                                <Grid item xs={4}>
                                  <Typography variant="body2" color="textSecondary">
                                    Products: {category.productCount}
                                  </Typography>
                                </Grid>
                                <Grid item xs={4}>
                                  <Typography variant="body2" color="textSecondary">
                                    Departments: {category.departmentCount}
                                  </Typography>
                                </Grid>
                              </Grid>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        {t("loadingEnhancedCategories") || "Loading enhanced categories..."}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Box>
            </Fade>
          )}

          {/* Department Analysis Tab */}
          {activeTab === 2 && (
            <Fade in={activeTab === 2} timeout={300}>
              <Box>
                <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="600" gutterBottom>
                      {t("departmentCategoryPreferences") || "Department Category Preferences"}
                    </Typography>
                    {phase2Data.departmentPreferences?.departmentAnalysis ? (
                      <Box>
                        {phase2Data.departmentPreferences.departmentAnalysis.map((dept, index) => (
                          <Box key={dept.department} sx={{ mb: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                              <Typography variant="h6" fontWeight="600">
                                {dept.department}
                              </Typography>
                              <Box display="flex" gap={1}>
                                <Chip 
                                  label={`${dept.totalQuantity} items`}
                                  color="primary"
                                  size="small"
                                />
                                <Chip 
                                  label={`${dept.categoryCount} categories`}
                                  color="secondary"
                                  size="small"
                                />
                                <Chip 
                                  label={`${Math.round((dept.diversity || 0) * 100)}% diversity`}
                                  color="info"
                                  size="small"
                                />
                              </Box>
                            </Box>
                            
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                              Top Category: {dept.topCategory}
                            </Typography>
                            
                            <Box sx={{ mt: 2 }}>
                              {dept.categories?.slice(0, 5).map((category, catIndex) => (
                                <Box key={category.category} sx={{ mb: 1 }}>
                                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                                    <Typography variant="body2" fontWeight="500">
                                      {category.category}
                                    </Typography>
                                    <Typography variant="body2" color="primary.main" fontWeight="600">
                                      {category.quantity} ({category.percentage}%)
                                    </Typography>
                                  </Box>
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={category.percentage}
                                    sx={{ height: 6, borderRadius: 3 }}
                                  />
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        {t("loadingDepartmentPreferences") || "Loading department preferences..."}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Box>
            </Fade>
          )}

          {/* Advanced Filtering Tab */}
          {activeTab === 3 && (
            <Fade in={activeTab === 3} timeout={300}>
              <Box>
                <Grid container spacing={3}>
                  <Grid item xs={12} lg={4}>
                    <AdvancedFilters
                      onFiltersChange={handleFiltersChange}
                      onSaveFilter={handleSaveFilter}
                      savedFilters={savedFilters}
                      loading={loading}
                    />
                  </Grid>
                  <Grid item xs={12} lg={8}>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight="600" gutterBottom>
                          {t("filteredResults") || "Filtered Results"}
                        </Typography>
                        {phase2Data.filteredAnalytics ? (
                          <Box>
                            <Alert severity="info" sx={{ mb: 3 }}>
                              <Typography variant="body2">
                                Showing {phase2Data.filteredAnalytics.summary?.totalRecords || 0} records 
                                with {phase2Data.filteredAnalytics.summary?.totalQuantity || 0} total quantity
                              </Typography>
                            </Alert>
                            
                            {/* Top Departments */}
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                                Top Departments
                              </Typography>
                              {phase2Data.filteredAnalytics.topDepartments?.map((dept, index) => (
                                <Box key={dept.name} sx={{ mb: 1 }}>
                                  <Box display="flex" justifyContent="space-between">
                                    <Typography variant="body2">{dept.name}</Typography>
                                    <Typography variant="body2" color="primary.main" fontWeight="600">
                                      {dept.quantity}
                                    </Typography>
                                  </Box>
                                </Box>
                              ))}
                            </Box>
                            
                            {/* Top Categories */}
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                                Top Categories
                              </Typography>
                              {phase2Data.filteredAnalytics.topCategories?.map((cat, index) => (
                                <Box key={cat.name} sx={{ mb: 1 }}>
                                  <Box display="flex" justifyContent="space-between">
                                    <Typography variant="body2">{cat.name}</Typography>
                                    <Typography variant="body2" color="secondary.main" fontWeight="600">
                                      {cat.quantity}
                                    </Typography>
                                  </Box>
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            {t("applyFiltersToSeeResults") || "Apply filters to see results"}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </Fade>
          )}

          {/* System Health Tab */}
          {activeTab === 4 && (
            <Fade in={activeTab === 4} timeout={300}>
              <Box>
                {phase2Data.systemHealth ? (
                  <Grid container spacing={3}>
                    {/* Performance Metrics */}
                    <Grid item xs={12} md={6}>
                      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <CardContent sx={{ p: 3 }}>
                          <Typography variant="h6" fontWeight="600" gutterBottom>
                            {t("performanceMetrics") || "Performance Metrics"}
                          </Typography>
                          <List>
                            <ListItem>
                              <ListItemIcon>
                                <PerformanceIcon color="primary" />
                              </ListItemIcon>
                              <ListItemText
                                primary="Response Time"
                                secondary={phase2Data.systemHealth.performanceMetrics?.totalResponseTime}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon>
                                <AssessmentIcon color="success" />
                              </ListItemIcon>
                              <ListItemText
                                primary="Query Time"
                                secondary={phase2Data.systemHealth.performanceMetrics?.queryTime}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon>
                                <TrendingUpIcon color="info" />
                              </ListItemIcon>
                              <ListItemText
                                primary="Records/Second"
                                secondary={phase2Data.systemHealth.performanceMetrics?.recordsPerSecond}
                              />
                            </ListItem>
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Memory Metrics */}
                    <Grid item xs={12} md={6}>
                      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <CardContent sx={{ p: 3 }}>
                          <Typography variant="h6" fontWeight="600" gutterBottom>
                            {t("memoryMetrics") || "Memory Metrics"}
                          </Typography>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" gutterBottom>
                              Memory Usage: {phase2Data.systemHealth.memoryMetrics?.memoryUsagePercent}%
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={phase2Data.systemHealth.memoryMetrics?.memoryUsagePercent || 0}
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                          </Box>
                          <Typography variant="body2" color="textSecondary">
                            Used: {phase2Data.systemHealth.memoryMetrics?.usedMemory}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Total: {phase2Data.systemHealth.memoryMetrics?.totalMemory}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Recommendations */}
                    <Grid item xs={12}>
                      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <CardContent sx={{ p: 3 }}>
                          <Typography variant="h6" fontWeight="600" gutterBottom>
                            {t("recommendations") || "Recommendations"}
                          </Typography>
                          {phase2Data.systemHealth.recommendations?.map((rec, index) => (
                            <Alert key={index} severity="info" sx={{ mb: 1 }}>
                              {rec}
                            </Alert>
                          ))}
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    {t("loadingSystemHealth") || "Loading system health metrics..."}
                  </Typography>
                )}
              </Box>
            </Fade>
          )}
        </Box>
      </ResponsiveContainer>
    </AdminLayout>
  );
}