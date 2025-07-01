import { useState, useEffect, useContext } from "react";
import {
  Box,
  Button,
  Typography,
  Avatar,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
  Tooltip,
  Stack,
  Paper,
  Card,
  CardContent,
  Grid,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Inventory as InventoryIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Translate as TranslateIcon,
  Image as ImageIcon,
  QrCode as CodeIcon,
  Category as CategoryIcon,
  Scale as UnitIcon,
  Settings as ActionsIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import AdminLayout from "layouts/AdminLayout";
import LanguageToggle from "components/common/LanguageToggle";
import ConfirmDialog from "components/common/ConfirmDialog";

import { WsContext } from "context/WsContext";
import { productApi, unitApi, categoryApi } from "services/api";
import { getProductImageUrl } from "utils/apiUtils";
import { toastUtils } from "utils/toastUtils";
import { getProductName } from "utils/productNameUtils";
import { getCategoryNameSimple } from "utils/categoryNameUtils";

import ProductDialog from "./ProductDialog";

export default function EnhancedProductManagement() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const [rows, setRows] = useState([]);
  const [units, setUnits] = useState([]);
  const [categories, setCategories] = useState([]);

  const [dlgOpen, setDlgOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, product: null });
  const [refreshing, setRefreshing] = useState(false);

  const { subscribe } = useContext(WsContext);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [p, u, c] = await Promise.all([
        productApi.all(), 
        unitApi.all(),
        categoryApi.all()
      ]);
      
      // Handle different response formats
      const products = Array.isArray(p) ? p : p?.content || [];
      const unitsData = Array.isArray(u) ? u : [];
      const categoriesData = Array.isArray(c) ? c : [];
      
      console.log('🔍 ProductManagement: Categories data:', categoriesData);
      console.log('🔍 ProductManagement: Sample category:', categoriesData[0]);
      
      setRows(products);
      setUnits(unitsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setError(error);
      setRows([]);
      setUnits([]);
      setCategories([]);
      toast.error(t("failedToLoadData") || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [t, i18n.language]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchData();
      toast.success(t("dataRefreshed") || "Data refreshed successfully");
    } catch (error) {
      toast.error(t("refreshFailed") || "Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  const openAdd = () => {
    setEditRow(null);
    setDlgOpen(true);
  };
  
  const openEdit = (r) => {
    setEditRow(r);
    setDlgOpen(true);
  };

  // Get category name by ID using translation utility
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.categoryId === categoryId);
    return category ? getCategoryNameSimple(category, i18n.language) : "—";
  };

  // Get unit name by ID using i18n context
  const getUnitName = (unitId) => {
    const unit = units.find(u => u.id === unitId || u.unitId === unitId);
    if (!unit) return "—";
    
    // Use the same pattern as categories - prefer current language, fallback to other
    if (i18n.language === "vi") {
      return unit.nameVn || unit.nameEn || unit.name || "—";
    } else {
      return unit.nameEn || unit.nameVn || unit.name || "—";
    }
  };

  // Get product name using translation utility
  const getProductDisplayName = (product) => {
    const nameResult = getProductName(product, i18n.language);
    return nameResult.name;
  };

  // Check if product has translation
  const hasProductTranslation = (product) => {
    const nameResult = getProductName(product, i18n.language);
    return nameResult.hasTranslation;
  };

  // Compact header component with reduced spacing
  const EnhancedHeader = () => (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2, 
        mb: 2, 
        borderRadius: 2,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Smaller decorative background elements */}
      <Box sx={{
        position: 'absolute',
        top: -30,
        right: -30,
        width: 80,
        height: 80,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)',
        zIndex: 1
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: -20,
        left: -20,
        width: 60,
        height: 60,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)',
        zIndex: 1
      }} />
      
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: 'relative', zIndex: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
            <InventoryIcon fontSize="medium" />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
              {t("productManagement") || "Product Management"}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.875rem' }}>
              {t("manageProductsDescription") || "Manage your product inventory and details"}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <LanguageToggle size="small" sx={{ color: 'white' }} />
          <Tooltip title={t("refreshData") || "Refresh Data"}>
            <IconButton
              onClick={handleRefresh}
              disabled={refreshing}
              size="small"
              sx={{ 
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
              }}
            >
              <RefreshIcon sx={{ 
                fontSize: '1.2rem',
                animation: refreshing ? "spin 1s linear infinite" : "none",
                "@keyframes spin": {
                  "0%": { transform: "rotate(0deg)" },
                  "100%": { transform: "rotate(360deg)" }
                }
              }} />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            size="medium"
            startIcon={<AddIcon />}
            onClick={openAdd}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              borderRadius: 1.5,
              px: 2.5,
              py: 1,
              fontSize: '0.875rem',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.3)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.3)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              }
            }}
          >
            {t("addProduct") || "Add Product"}
          </Button>
        </Box>
      </Box>
    </Paper>
  );

  // Enhanced table container with beautiful styling
  const EnhancedTableContainer = ({ children }) => (
    <Card 
      elevation={0} 
      sx={{ 
        borderRadius: 4,
        overflow: 'hidden',
        background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
        border: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.06)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #667eea 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 3s ease-in-out infinite',
          '@keyframes shimmer': {
            '0%': { backgroundPosition: '-200% 0' },
            '100%': { backgroundPosition: '200% 0' }
          }
        }
      }}
    >
      {children}
    </Card>
  );

  // Compact search and filter bar
  const EnhancedSearchBar = () => (
    <Box sx={{ 
      p: 2, 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      borderBottom: '1px solid rgba(0,0,0,0.08)'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <SearchIcon sx={{ color: 'text.secondary', fontSize: '1.2rem' }} />
          <Typography variant="h6" fontWeight="600" sx={{ color: 'text.primary', fontSize: '1.1rem' }}>
            {t("productInventory") || "Product Inventory"}
          </Typography>
          <Chip 
            label={`${rows.length} ${t("products") || "products"}`}
            size="small"
            sx={{ 
              bgcolor: 'primary.main',
              color: 'white',
              fontWeight: 600,
              height: 24,
              '& .MuiChip-label': { px: 1, fontSize: '0.75rem' }
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
            {t("lastUpdated") || "Last updated"}: {new Date().toLocaleTimeString()}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  // Custom header component with professional styling and better readability
  const CustomColumnHeader = ({ icon: Icon, title }) => (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ height: '100%' }}>
      <Icon sx={{ 
        fontSize: '1.2rem', 
        color: 'white',
        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
      }} />
      <Typography 
        variant="subtitle2" 
        fontWeight={700}
        sx={{ 
          color: 'white',
          letterSpacing: '0.8px',
          fontSize: '0.85rem',
          textTransform: 'uppercase',
          textShadow: '0 1px 2px rgba(0,0,0,0.1)',
        }}
      >
        {title}
      </Typography>
    </Stack>
  );

  // Define columns for DataGrid with custom headers and optimized spacing
  const columns = [
    {
      field: "image",
      headerName: "", // We'll use renderHeader instead
      width: i18n.language === 'vi' ? 100 : 80,
      sortable: false,
      renderHeader: () => (
        <CustomColumnHeader 
          icon={ImageIcon} 
          title={i18n.language === 'vi' ? 'Hình ảnh' : 'Image'}
        />
      ),
      renderCell: ({ row }) => (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%',
          width: '100%'
        }}>
          <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img 
              src={row.image && row.image !== 'null' ? getProductImageUrl(row.image) : '/placeholder-prod.png'}
              alt={getProductDisplayName(row)}
              style={{ 
                width: 56, 
                height: 56,
                objectFit: 'cover',
                borderRadius: '12px',
                border: '3px solid #667eea',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2), 0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease-in-out',
                display: 'block'
              }}
              onError={(e) => {
                e.target.src = '/placeholder-prod.png';
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.1)';
                e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.3), 0 4px 8px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.2), 0 2px 4px rgba(0,0,0,0.1)';
              }}
            />
            {row.image && row.image !== 'null' && (
              <Box sx={{
                position: 'absolute',
                top: -2,
                right: -2,
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: '2px solid white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }} />
            )}
          </Box>
        </Box>
      ),
    },
    {
      field: "code",
      headerName: "",
      width: 120,
      renderHeader: () => (
        <CustomColumnHeader 
          icon={CodeIcon} 
          title={i18n.language === 'vi' ? 'Mã SP' : 'Code'}
        />
      ),
      renderCell: ({ row }) => (
        <Chip
          label={row.code}
          variant="filled"
          sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.8rem',
            letterSpacing: '0.5px',
            borderRadius: '8px',
            height: '32px',
            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
            border: '1px solid rgba(255,255,255,0.2)',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
            },
            '& .MuiChip-label': {
              px: 2,
            }
          }}
        />
      )
    },
    { 
      field: "name", 
      headerName: "",
      flex: 1, // Give most space to product name
      minWidth: 250, // Increased minimum width for better readability
      renderHeader: () => (
        <CustomColumnHeader 
          icon={InventoryIcon} 
          title={i18n.language === 'vi' ? 'Tên sản phẩm' : 'Product Name'}
        />
      ),
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography 
            variant="body2" 
            fontWeight="500"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1 // Allow text to take available space
            }}
            title={getProductDisplayName(row)} // Show full name on hover
          >
            {getProductDisplayName(row)}
          </Typography>
          {!hasProductTranslation(row) && (
            <Tooltip title={
              i18n.language === 'en' 
                ? 'English translation not available' 
                : 'Bản dịch tiếng Việt chưa có'
            }>
              <Chip
                icon={<TranslateIcon />}
                label={i18n.language === 'en' ? 'VN' : 'EN'}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: '0.6rem',
                  height: 20,
                  borderColor: 'warning.main',
                  color: 'warning.main',
                  flexShrink: 0, // Prevent chip from shrinking
                  '& .MuiChip-label': {
                    px: 0.5,
                  },
                  '& .MuiChip-icon': {
                    fontSize: '0.7rem',
                  },
                }}
              />
            </Tooltip>
          )}
        </Box>
      )
    },
    { 
      field: "category", 
      headerName: "",
      flex: 0.5, // Give good space to category name
      minWidth: i18n.language === 'vi' ? 150 : 180, // Increased minimum width
      renderHeader: () => (
        <CustomColumnHeader 
          icon={CategoryIcon} 
          title={i18n.language === 'vi' ? 'Danh mục' : 'Category'}
        />
      ),
      renderCell: ({ row }) => (
        <Typography 
          variant="body2" 
          fontWeight="500"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
          title={getCategoryName(row.categoryId)} // Show full name on hover
        >
          {getCategoryName(row.categoryId)}
        </Typography>
      )
    },
    { 
      field: "unit", 
      headerName: "",
      width: i18n.language === 'vi' ? 100 : 120, // Keep compact width
      renderHeader: () => (
        <CustomColumnHeader 
          icon={UnitIcon} 
          title={i18n.language === 'vi' ? 'Đơn vị' : 'Unit'}
        />
      ),
      renderCell: ({ row }) => (
        <Typography variant="body2" fontWeight="500">
          {getUnitName(row.unitId)}
        </Typography>
      )
    },
    {
      field: "actions",
      headerName: "",
      width: 120, // Keep compact width
      sortable: false,
      renderHeader: () => (
        <CustomColumnHeader 
          icon={ActionsIcon} 
          title={i18n.language === 'vi' ? 'Thao tác' : 'Actions'}
        />
      ),
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
          <Tooltip title={t("editProduct") || "Edit Product"} arrow>
            <IconButton
              size="small"
              onClick={() => openEdit(row)}
              sx={{
                width: 36,
                height: 36,
                background: 'linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%)',
                color: 'white',
                boxShadow: '0 2px 8px rgba(79, 195, 247, 0.3)',
                border: '1px solid rgba(255,255,255,0.2)',
                '&:hover': { 
                  background: 'linear-gradient(135deg, #29b6f6 0%, #0288d1 100%)',
                  transform: 'translateY(-2px) scale(1.05)',
                  boxShadow: '0 4px 12px rgba(79, 195, 247, 0.4)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t("deleteProduct") || "Delete Product"} arrow>
            <IconButton
              size="small"
              onClick={() => handleDelete(row)}
              sx={{
                width: 36,
                height: 36,
                background: 'linear-gradient(135deg, #ef5350 0%, #e53935 100%)',
                color: 'white',
                boxShadow: '0 2px 8px rgba(239, 83, 80, 0.3)',
                border: '1px solid rgba(255,255,255,0.2)',
                '&:hover': { 
                  background: 'linear-gradient(135deg, #e53935 0%, #c62828 100%)',
                  transform: 'translateY(-2px) scale(1.05)',
                  boxShadow: '0 4px 12px rgba(239, 83, 80, 0.4)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const saveProduct = async (draft, imageFile) => {
    try {
      let saved;
      
      // First save the product data
      if (editRow) {
        console.log('🔍 ProductManagement: Updating existing product:', editRow.id);
        saved = await productApi.update(editRow.id, draft);
      } else {
        console.log('🔍 ProductManagement: Creating new product');
        saved = await productApi.add(draft);
      }
      
      console.log('🔍 ProductManagement: Product saved:', saved);
      
      // Handle image upload if present
      if (imageFile && saved?.id) {
        const fd = new FormData();
        fd.append("file", imageFile);
        let tId = null;
        
        try {
          console.log('🔍 ProductManagement: Starting image upload for product:', saved.id);
          
          tId = toastUtils.loading("Uploading image…");
          
          const productWithImage = await productApi.uploadImage(saved.id, fd);
          console.log('✅ ProductManagement: Image upload successful:', productWithImage);
          
          toastUtils.updateToSuccess(tId, "Image uploaded successfully!");
          
          // Update saved object with image info if available
          if (productWithImage && typeof productWithImage === 'object') {
            saved = {
              ...saved,
              ...productWithImage,
              id: productWithImage.id || saved.id
            };
          }
          
        } catch (uploadError) {
          console.error('❌ ProductManagement: Image upload failed:', uploadError);
          
          const errorMessage = uploadError.response?.data?.message || uploadError.message || 'Unknown upload error';
          toastUtils.updateToError(tId, `Image upload failed: ${errorMessage}`);
          
          // Continue without the image - don't fail the entire save
          console.warn('⚠️ ProductManagement: Continuing without image due to upload failure');
        }
      }
      
      // Update the rows state
      if (editRow) {
        setRows((p) => p.map((r) => (r.id === saved.id ? saved : r)));
      } else {
        setRows((p) => [...p, saved]);
      }
      
      setDlgOpen(false);
      toast.success(editRow ? (t("productUpdated") || "Product updated") : (t("productAdded") || "Product added"));
    } catch (e) {
      console.error("Save error:", e);
      toast.error(e.response?.data?.message || e.message || "Save error");
    }
  };

  const handleDelete = (product) => {
    setDeleteDialog({ open: true, product });
  };

  const confirmDelete = async () => {
    if (!deleteDialog.product) return;
    
    try {
      await productApi.delete(deleteDialog.product.id);
      setRows((p) => p.filter((r) => r.id !== deleteDialog.product.id));
      toast.success(t("productDeleted") || "Product deleted");
      setDeleteDialog({ open: false, product: null });
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || error.message || "Delete error");
    }
  };

  const cancelDelete = () => {
    setDeleteDialog({ open: false, product: null });
  };

  if (error) {
    return (
      <AdminLayout titleKey="productManagement" icon="inventory">
        <Box sx={{ p: 3 }}>
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t("errorLoadingProducts") || "Error Loading Products"}
            </Typography>
            <Typography variant="body2">
              {error?.message || "Failed to load products"}
            </Typography>
            <Button onClick={() => window.location.reload()} sx={{ mt: 2 }}>
              {t("retry") || "Retry"}
            </Button>
          </Alert>
        </Box>
      </AdminLayout>
    );
  }

  if (loading) {
    return (
      <AdminLayout titleKey="productManagement" icon="inventory">
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 2 }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
            {t("loadingProducts") || "Loading products..."}
          </Typography>
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout titleKey="productManagement" icon="inventory">
      {/* Enhanced Header */}
      <EnhancedHeader />

      {/* Enhanced Data Grid with Beautiful Styling */}
      <EnhancedTableContainer>
        <EnhancedSearchBar />
        <Box sx={{ 
          height: 700, 
          width: "100%",
        }}>
          <DataGrid
            rows={rows}
            columns={columns}
            getRowId={(r) => r.id}
            slots={{ toolbar: GridToolbar }}
            disableRowSelectionOnClick
            rowHeight={90}
            sx={{
              border: 'none',
              "& .MuiDataGrid-root": {
                border: 'none',
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
              },
              "& .MuiDataGrid-cell": {
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                padding: '16px 20px',
                transition: 'all 0.2s ease-in-out',
              },
              "& .MuiDataGrid-columnHeaders": { 
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderBottom: 'none',
                minHeight: '72px !important',
                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.15)',
                '& .MuiDataGrid-columnHeader': {
                  color: 'white',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.1)',
                  },
                },
                '& .MuiDataGrid-iconSeparator': {
                  color: 'rgba(255,255,255,0.5)',
                },
                '& .MuiDataGrid-sortIcon': {
                  color: 'white',
                },
                '& .MuiDataGrid-menuIcon': {
                  color: 'white',
                },
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: '700',
                fontSize: '0.9rem',
                color: 'white',
              },
              "& .MuiDataGrid-columnHeader": {
                padding: '16px 20px',
                outline: 'none',
                '&:focus': {
                  outline: 'none',
                },
                '&:focus-within': {
                  outline: 'none',
                },
              },
              "& .MuiDataGrid-row": {
                minHeight: '90px !important',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                '&:hover': { 
                  bgcolor: "rgba(102, 126, 234, 0.04)",
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.08), 0 4px 10px rgba(102, 126, 234, 0.1)',
                  '& .MuiDataGrid-cell': {
                    borderBottom: '1px solid rgba(102, 126, 234, 0.2)',
                  },
                },
                '&:nth-of-type(even)': {
                  bgcolor: 'rgba(248, 250, 252, 0.5)',
                },
                '&.Mui-selected': {
                  bgcolor: 'rgba(102, 126, 234, 0.08)',
                  '&:hover': {
                    bgcolor: 'rgba(102, 126, 234, 0.12)',
                  },
                },
              },
              "& .MuiDataGrid-toolbarContainer": {
                padding: '20px 24px',
                borderBottom: '1px solid rgba(0,0,0,0.08)',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                '& .MuiButton-root': {
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600,
                },
                '& .MuiInputBase-root': {
                  borderRadius: '8px',
                  bgcolor: 'white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                },
              },
              "& .MuiDataGrid-footerContainer": {
                borderTop: '1px solid rgba(0,0,0,0.08)',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                padding: '20px 24px',
                minHeight: '64px',
              },
              "& .MuiTablePagination-root": {
                color: '#64748b',
                minHeight: '64px',
              },
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                fontWeight: 500,
                fontSize: '0.875rem',
              },
              "& .MuiTablePagination-select": {
                fontSize: '0.875rem',
              },
              "& .MuiTablePagination-actions": {
                '& .MuiIconButton-root': {
                  padding: '8px',
                  margin: '0 2px',
                },
              },
              "& .MuiDataGrid-overlay": {
                background: 'rgba(248, 250, 252, 0.9)',
                backdropFilter: 'blur(4px)',
              },
            }}
          />
        </Box>
      </EnhancedTableContainer>
      
      <ProductDialog
        open={dlgOpen}
        onClose={() => setDlgOpen(false)}
        onSave={saveProduct}
        product={editRow}
        units={units}
        categories={categories}
      />

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title={t("confirmDeleteProduct") || "Delete Product"}
        message={
          deleteDialog.product 
            ? `${t("confirmDeleteProductMessage") || "Are you sure you want to delete"} "${getProductDisplayName(deleteDialog.product)}"? ${t("actionCannotBeUndone") || "This action cannot be undone."}`
            : ""
        }
        confirmText={t("delete") || "Delete"}
        cancelText={t("cancel") || "Cancel"}
        type="error"
        severity="high"
      />
    </AdminLayout>
  );
}