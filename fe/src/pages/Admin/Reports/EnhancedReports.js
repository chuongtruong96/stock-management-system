import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
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
} from "@mui/material";
import {
  Analytics as AnalyticsIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon,
  Assessment as AssessmentIcon,
  TableChart as TableIcon,
  FilterList as FilterIcon,
  Dashboard as DashboardIcon,
  BarChart as ChartIcon,
  ViewModule as ViewIcon,
  TrendingUp as TrendingUpIcon,
  Compare as CompareIcon,
  Category as CategoryIcon,
} from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import AdminLayout from "layouts/AdminLayout";
import LanguageToggle from "components/common/LanguageToggle";
import { DatePresets, ExportManager, ResponsiveContainer } from "./components";
import { reportApi } from "services/api";
import { reportApi } from "services/api";

export default function EnhancedReports() {
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
  
  // Data state - aligned with backend ReportDTO structure
  const [reportData, setReportData] = useState([]);
  const [analyticsData, setAnalyticsData] = useState({
    departments: null,
    trends: null,
    comparison: null,
    categories: null,
    realtime: null,
  });
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch basic report data using actual backend endpoints
  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use actual backend endpoint: /api/reports?year&month
      const summaryData = await reportApi.getSummary(year, month);
      console.log('📊 Enhanced Reports: Fetched summary data:', summaryData);
      
      if (Array.isArray(summaryData)) {
        // Map backend ReportDTO to frontend format
        const processedData = summaryData.map((item, index) => ({
          id: item.id || index,
          // Backend ReportDTO fields
          department: item.department || 'Unknown',
          productCode: item.productCode || '',
          productNameVn: item.productNameVn || '',
          productNameEn: item.productNameEn || item.productNameVn || '', // Fallback
          quantity: item.quantity || 0,
          unit: item.unit || '',
          // Additional computed fields for compatibility
          category: 'Unknown', // Not available in current backend
          createdAt: new Date().toISOString(), // Not available in aggregated data
        }));
        
        setReportData(processedData);
        setLastUpdated(new Date().toISOString());
        
        if (processedData.length === 0) {
          toast.info(t("noDataForPeriod") || "No data available for this period");
        } else {
          toast.success(t("dataLoaded") || `Loaded ${processedData.length} records`);
        }
      } else {
        setReportData([]);
        toast.warning(t("unexpectedDataFormat") || "Unexpected data format received");
      }
    } catch (err) {
      console.error('❌ Enhanced Reports: Fetch error:', err);
      setError(err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to load report data";
      toast.error(errorMessage);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  }, [year, month, t]);

  // Fetch enhanced analytics data
  const fetchAnalyticsData = useCallback(async () => {
    try {
      console.log('📊 Enhanced Reports: Fetching analytics data...');
      
      const [departments, trends, categories, realtime] = await Promise.all([
        reportApi.getDepartmentAnalytics(year, month).catch(err => {
          console.warn('Department analytics failed:', err);
          return null;
        }),
        reportApi.getProductTrends(year, month, 6).catch(err => {
          console.warn('Product trends failed:', err);
          return null;
        }),
        reportApi.getCategoryDistribution(year, month).catch(err => {
          console.warn('Category distribution failed:', err);
          return null;
        }),
        reportApi.getRealtimeStats().catch(err => {
          console.warn('Realtime stats failed:', err);
          return null;
        }),
      ]);

      // Get comparison with previous month
      let comparison = null;
      try {
        const prevMonth = month === 1 ? 12 : month - 1;
        const prevYear = month === 1 ? year - 1 : year;
        comparison = await reportApi.getComparison(year, month, prevYear, prevMonth);
      } catch (err) {
        console.warn('Comparison failed:', err);
      }
      
      setAnalyticsData({ departments, trends, comparison, categories, realtime });
      console.log('📊 Enhanced Reports: Analytics data loaded:', { departments, trends, comparison, categories, realtime });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Some analytics features may not be available');
    }
  }, [year, month]);

  // Export functionality using actual backend endpoints
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
      link.setAttribute("download", `enhanced_report_${year}_${month}.${extension}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(t("exportSuccess") || "Export completed successfully");
    } catch (err) {
      console.error('❌ Enhanced Reports: Export error:', err);
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
    fetchReportData();
    fetchAnalyticsData();
  }, [fetchReportData, fetchAnalyticsData]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      if (activeTab === 0) { // Only refresh on overview tab
        reportApi.getRealtimeStats()
          .then(stats => {
            setAnalyticsData(prev => ({ ...prev, realtime: stats }));
          })
          .catch(err => console.warn('Auto-refresh failed:', err));
      }
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [autoRefresh, activeTab]);

  // Tab configuration - enhanced with analytics
  const reportTabs = [
    {
      label: t('overview') || 'Overview',
      icon: DashboardIcon,
      value: 0
    },
    {
      label: t('analytics') || 'Analytics',
      icon: AnalyticsIcon,
      value: 1
    },
    {
      label: t('trends') || 'Trends',
      icon: TrendingUpIcon,
      value: 2
    },
    {
      label: t('comparison') || 'Comparison',
      icon: CompareIcon,
      value: 3
    },
    {
      label: t('dataTable') || 'Data Table',
      icon: TableIcon,
      value: 4
    }
  ];

  // Calculate basic statistics from actual data
  const summaryStats = {
    totalRecords: reportData.length,
    totalQuantity: reportData.reduce((sum, item) => sum + (item.quantity || 0), 0),
    uniqueDepartments: new Set(reportData.map(item => item.department)).size,
    uniqueProducts: new Set(reportData.map(item => item.productCode)).size,
    topProduct: reportData.reduce((max, item) => 
      (item.quantity || 0) > (max?.quantity || 0) ? item : max, null
    ),
    topDepartment: Object.entries(
      reportData.reduce((acc, item) => {
        acc[item.department] = (acc[item.department] || 0) + item.quantity;
        return acc;
      }, {})
    ).sort(([,a], [,b]) => b - a)[0]
  };

  // DataGrid columns aligned with backend ReportDTO
  const columns = [
    {
      field: "department",
      headerName: t("department") || "Department",
      flex: 1,
      minWidth: 150,
      renderCell: ({ value }) => (
        <Typography variant="body2" fontWeight="500">
          {value || "—"}
        </Typography>
      )
    },
    {
      field: "productCode",
      headerName: t("productCode") || "Product Code",
      width: 140,
      renderCell: ({ value }) => (
        <Chip
          label={value || "—"}
          size="small"
          variant="outlined"
          color="primary"
          sx={{ fontWeight: 600 }}
        />
      )
    },
    {
      field: "productNameVn",
      headerName: t("productName") || "Product Name",
      flex: 2,
      minWidth: 200,
      renderCell: ({ value }) => (
        <Typography 
          variant="body2" 
          fontWeight="500"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
          title={value || "—"}
        >
          {value || "—"}
        </Typography>
      )
    },
    {
      field: "quantity",
      headerName: t("quantity") || "Quantity",
      width: 120,
      align: "center",
      renderCell: ({ value }) => (
        <Chip
          label={value || 0}
          size="small"
          color="success"
          sx={{ fontWeight: 600, minWidth: 60 }}
        />
      )
    },
    {
      field: "unit",
      headerName: t("unit") || "Unit",
      width: 100,
      align: "center",
      renderCell: ({ value }) => (
        <Typography variant="body2" color="textSecondary">
          {value || "—"}
        </Typography>
      )
    }
  ];

  return (
    <AdminLayout titleKey="enhancedReports" icon="analytics">
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
                {t("enhancedReportsAnalytics") || "Enhanced Reports & Analytics"}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {t("enhancedReportsDescription") || "Advanced analytics with real-time insights and trends"}
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                onClick={() => {
                  fetchReportData();
                  fetchAnalyticsData();
                }}
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

        {/* Controls Panel */}
        <Card className="controls-panel" sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
              <Box display="flex" alignItems="center" gap={2}>
                <FilterIcon color="primary" />
                <Typography variant="h6" fontWeight="600">
                  {t("reportFilters") || "Report Filters"}
                </Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                {t("selectPeriod") || "Select the period for your report"}
              </Typography>
            </Box>

            <DatePresets 
              onPresetSelect={handlePresetSelect}
              currentMonth={month}
              currentYear={year}
            />

            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="medium">
                  <InputLabel sx={{ color: '#000000' }}>{t("month") || "Month"}</InputLabel>
                  <Select
                    value={month}
                    label={t("month") || "Month"}
                    onChange={(e) => setMonth(e.target.value)}
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
                    {Array.from({ length: 12 }, (_, i) => (
                      <MenuItem 
                        key={i + 1} 
                        value={i + 1}
                        sx={{ color: '#000000' }} // Black text in dropdown items
                      >
                        {new Date(2024, i, 1).toLocaleDateString(i18n.language, { month: 'long' })}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="medium"
                  label={t("year") || "Year"}
                  type="number"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  inputProps={{ min: 2020, max: 2030 }}
                  InputLabelProps={{
                    sx: { color: '#000000' }
                  }}
                  sx={{
                    '& .MuiInputBase-input': {
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
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => {
                    fetchReportData();
                    fetchAnalyticsData();
                  }}
                  disabled={loading}
                  startIcon={loading ? <RefreshIcon className="animate-spin" /> : <AssessmentIcon />}
                  sx={{ 
                    borderRadius: 2,
                    py: 1.5,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    }
                  }}
                >
                  {loading ? (t("generating") || "Generating...") : (t("generateReport") || "Generate Report")}
                </Button>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <ExportManager
                  onExport={handleExport}
                  disabled={loading}
                  loading={exporting}
                  dataCount={reportData.length}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Tab Content */}
        <Box sx={{ mt: 3 }}>
          {/* Overview Tab */}
          {activeTab === 0 && (
            <Fade in={activeTab === 0} timeout={300}>
              <Box>
                {/* Real-time Stats */}
                {analyticsData.realtime && (
                  <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight="600" gutterBottom>
                        {t("realtimeStats") || "Real-time Statistics"}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6} md={3}>
                          <Box textAlign="center">
                            <Typography variant="h4" color="primary.main" fontWeight="bold">
                              {analyticsData.realtime.todayOrders}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {t("todayOrders") || "Today's Orders"}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Box textAlign="center">
                            <Typography variant="h4" color="success.main" fontWeight="bold">
                              {analyticsData.realtime.weekOrders}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {t("weekOrders") || "This Week"}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Box textAlign="center">
                            <Typography variant="h4" color="info.main" fontWeight="bold">
                              {analyticsData.realtime.monthOrders}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {t("monthOrders") || "This Month"}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Box textAlign="center">
                            <Typography variant="h4" color="warning.main" fontWeight="bold">
                              {analyticsData.realtime.pendingOrders}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {t("pendingOrders") || "Pending"}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                )}

                {/* Summary Cards */}
                <Grid container spacing={3} mb={4}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                      <CardContent sx={{ p: 3, textAlign: 'center' }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48, mx: 'auto', mb: 2 }}>
                          <TableIcon />
                        </Avatar>
                        <Typography variant="h4" fontWeight="bold" color="primary.main" gutterBottom>
                          {summaryStats.totalRecords}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {t("totalRecords") || "Total Records"}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                      <CardContent sx={{ p: 3, textAlign: 'center' }}>
                        <Avatar sx={{ bgcolor: 'success.main', width: 48, height: 48, mx: 'auto', mb: 2 }}>
                          <AnalyticsIcon />
                        </Avatar>
                        <Typography variant="h4" fontWeight="bold" color="success.main" gutterBottom>
                          {summaryStats.totalQuantity}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {t("totalQuantity") || "Total Quantity"}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                      <CardContent sx={{ p: 3, textAlign: 'center' }}>
                        <Avatar sx={{ bgcolor: 'info.main', width: 48, height: 48, mx: 'auto', mb: 2 }}>
                          <DashboardIcon />
                        </Avatar>
                        <Typography variant="h4" fontWeight="bold" color="info.main" gutterBottom>
                          {summaryStats.uniqueDepartments}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {t("departments") || "Departments"}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                      <CardContent sx={{ p: 3, textAlign: 'center' }}>
                        <Avatar sx={{ bgcolor: 'warning.main', width: 48, height: 48, mx: 'auto', mb: 2 }}>
                          <ViewIcon />
                        </Avatar>
                        <Typography variant="h4" fontWeight="bold" color="warning.main" gutterBottom>
                          {summaryStats.uniqueProducts}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {t("uniqueProducts") || "Unique Products"}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Key Insights */}
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight="600" gutterBottom>
                          {t("topDepartment") || "Top Department"}
                        </Typography>
                        {summaryStats.topDepartment ? (
                          <Box>
                            <Typography variant="h5" color="primary.main" fontWeight="bold">
                              {summaryStats.topDepartment[0]}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {summaryStats.topDepartment[1]} {t("items") || "items"}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            {t("noData") || "No data available"}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight="600" gutterBottom>
                          {t("topProduct") || "Top Product"}
                        </Typography>
                        {summaryStats.topProduct ? (
                          <Box>
                            <Typography variant="h6" color="success.main" fontWeight="bold">
                              {summaryStats.topProduct.productNameVn || summaryStats.topProduct.productCode}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {summaryStats.topProduct.quantity} {summaryStats.topProduct.unit}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            {t("noData") || "No data available"}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </Fade>
          )}

          {/* Analytics Tab */}
          {activeTab === 1 && (
            <Fade in={activeTab === 1} timeout={300}>
              <Box>
                <Grid container spacing={3}>
                  {/* Department Analytics */}
                  <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight="600" gutterBottom>
                          {t("departmentAnalytics") || "Department Analytics"}
                        </Typography>
                        {analyticsData.departments?.departments ? (
                          <Box sx={{ mt: 2 }}>
                            {analyticsData.departments.departments.slice(0, 5).map((dept, index) => (
                              <Box key={dept.name} sx={{ mb: 2 }}>
                                <Box display="flex" justifyContent="space-between" mb={1}>
                                  <Typography variant="body2" fontWeight="500">
                                    {dept.name}
                                  </Typography>
                                  <Typography variant="body2" color="primary.main" fontWeight="600">
                                    {dept.totalQuantity} ({dept.uniqueProducts} products)
                                  </Typography>
                                </Box>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={(dept.totalQuantity / Math.max(...analyticsData.departments.departments.map(d => d.totalQuantity))) * 100}
                                  sx={{ height: 8, borderRadius: 4 }}
                                />
                              </Box>
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            {t("loadingAnalytics") || "Loading analytics..."}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {/* Category Distribution */}
                  <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight="600" gutterBottom>
                          {t("categoryDistribution") || "Category Distribution"}
                        </Typography>
                        {analyticsData.categories?.distribution ? (
                          <Box sx={{ mt: 2 }}>
                            {analyticsData.categories.distribution.slice(0, 5).map((category, index) => (
                              <Box key={category.name} sx={{ mb: 2 }}>
                                <Box display="flex" justifyContent="space-between" mb={1}>
                                  <Typography variant="body2" fontWeight="500">
                                    {category.name}
                                  </Typography>
                                  <Typography variant="body2" color="success.main" fontWeight="600">
                                    {category.quantity} ({category.percentage}%)
                                  </Typography>
                                </Box>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={category.percentage}
                                  sx={{ height: 8, borderRadius: 4 }}
                                  color="success"
                                />
                              </Box>
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            {t("loadingCategories") || "Loading categories..."}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </Fade>
          )}

          {/* Trends Tab */}
          {activeTab === 2 && (
            <Fade in={activeTab === 2} timeout={300}>
              <Box>
                <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="600" gutterBottom>
                      {t("productTrends") || "Product Trends (6 Months)"}
                    </Typography>
                    {analyticsData.trends?.trends ? (
                      <Box sx={{ mt: 2 }}>
                        {analyticsData.trends.trends.map((trend, index) => (
                          <Box key={`${trend.year}-${trend.month}`} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="body1" fontWeight="500">
                                {trend.monthName} {trend.year}
                              </Typography>
                              <Box display="flex" gap={2}>
                                <Chip 
                                  label={`${trend.totalQuantity} items`}
                                  size="small"
                                  color="primary"
                                />
                                <Chip 
                                  label={`${trend.uniqueProducts} products`}
                                  size="small"
                                  color="secondary"
                                />
                                {trend.growthRate !== undefined && (
                                  <Chip 
                                    label={`${trend.growthRate > 0 ? '+' : ''}${trend.growthRate}%`}
                                    size="small"
                                    color={trend.growthRate > 0 ? "success" : trend.growthRate < 0 ? "error" : "default"}
                                  />
                                )}
                              </Box>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        {t("loadingTrends") || "Loading trends..."}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Box>
            </Fade>
          )}

          {/* Comparison Tab */}
          {activeTab === 3 && (
            <Fade in={activeTab === 3} timeout={300}>
              <Box>
                {analyticsData.comparison ? (
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <CardContent sx={{ p: 3 }}>
                          <Typography variant="h6" fontWeight="600" gutterBottom>
                            {t("currentPeriod") || "Current Period"}
                          </Typography>
                          <Typography variant="h4" color="primary.main" fontWeight="bold">
                            {analyticsData.comparison.current.totalQuantity}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {analyticsData.comparison.current.period}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <CardContent sx={{ p: 3 }}>
                          <Typography variant="h6" fontWeight="600" gutterBottom>
                            {t("previousPeriod") || "Previous Period"}
                          </Typography>
                          <Typography variant="h4" color="secondary.main" fontWeight="bold">
                            {analyticsData.comparison.previous.totalQuantity}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {analyticsData.comparison.previous.period}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                        <CardContent sx={{ p: 3 }}>
                          <Typography variant="h6" fontWeight="600" gutterBottom>
                            {t("changes") || "Changes"}
                          </Typography>
                          <Box display="flex" gap={2} flexWrap="wrap">
                            <Chip 
                              label={`Quantity: ${analyticsData.comparison.changes.quantityChange > 0 ? '+' : ''}${analyticsData.comparison.changes.quantityChange}%`}
                              color={analyticsData.comparison.changes.quantityChange > 0 ? "success" : analyticsData.comparison.changes.quantityChange < 0 ? "error" : "default"}
                            />
                            <Chip 
                              label={`Departments: ${analyticsData.comparison.changes.departmentChange > 0 ? '+' : ''}${analyticsData.comparison.changes.departmentChange}`}
                              color="info"
                            />
                            <Chip 
                              label={`Products: ${analyticsData.comparison.changes.productChange > 0 ? '+' : ''}${analyticsData.comparison.changes.productChange}`}
                              color="warning"
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    {t("loadingComparison") || "Loading comparison..."}
                  </Typography>
                )}
              </Box>
            </Fade>
          )}

          {/* Data Table Tab */}
          {activeTab === 4 && (
            <Fade in={activeTab === 4} timeout={300}>
              <Box>
                {error ? (
                  <Alert severity="error" sx={{ borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      {t("errorLoadingReport") || "Error Loading Report"}
                    </Typography>
                    <Typography variant="body2">
                      {error?.message || "Failed to load report data"}
                    </Typography>
                    <Button onClick={fetchReportData} sx={{ mt: 2 }}>
                      {t("retry") || "Retry"}
                    </Button>
                  </Alert>
                ) : (
                  <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
                    <CardContent sx={{ p: 0 }}>
                      <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Box display="flex" alignItems="center" gap={2}>
                            <TableIcon color="primary" />
                            <Typography variant="h6" fontWeight="600">
                              {t("reportData") || "Report Data"}
                            </Typography>
                            <Chip 
                              label={`${reportData.length} ${t("items") || "items"}`}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </Box>
                          <Typography variant="body2" color="textSecondary">
                            {t("reportPeriod") || "Period"}: {new Date(year, month - 1).toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' })}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ height: 600 }}>
                        <DataGrid
                          rows={reportData}
                          columns={columns}
                          loading={loading}
                          slots={{ toolbar: GridToolbar }}
                          disableRowSelectionOnClick
                          rowHeight={70}
                          sx={{
                            border: 'none',
                            '& .MuiDataGrid-root': {
                              border: 'none',
                            },
                            '& .MuiDataGrid-cell': {
                              borderBottom: '1px solid #f0f0f0',
                              fontSize: '0.9rem',
                              display: 'flex',
                              alignItems: 'center',
                              padding: '12px 16px',
                            },
                            '& .MuiDataGrid-columnHeaders': { 
                              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
                              borderBottom: '2px solid #64748b',
                              minHeight: '64px !important',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                            },
                            '& .MuiDataGrid-columnHeaderTitle': {
                              fontWeight: 'bold',
                              color: '#1a365d',
                            },
                            '& .MuiDataGrid-row': {
                              minHeight: '70px !important',
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': { 
                                bgcolor: 'rgba(25, 118, 210, 0.04)',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                              },
                              '&:nth-of-type(even)': {
                                bgcolor: 'rgba(0, 0, 0, 0.02)',
                              },
                            },
                            '& .MuiDataGrid-toolbarContainer': {
                              padding: '16px',
                              borderBottom: '1px solid #e0e0e0',
                              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                            },
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                )}
              </Box>
            </Fade>
          )}
        </Box>
      </ResponsiveContainer>
    </AdminLayout>
  );
}