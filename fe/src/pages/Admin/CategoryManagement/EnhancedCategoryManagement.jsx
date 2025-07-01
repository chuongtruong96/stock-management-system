import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Avatar,
  Stack,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Paper,
  Card,
  Chip,
  Tooltip,
  alpha,
  useTheme,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  UploadFile as UploadIcon,
  Visibility as VisibilityIcon,
  Inventory as InventoryIcon,
  MoreVert as MoreVertIcon,
  Category as CategoryIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  QrCode as CodeIcon,
  Language as LanguageIcon,
  Settings as ActionsIcon,
} from "@mui/icons-material";
import AdminLayout from "layouts/AdminLayout";
import LanguageToggle from "components/common/LanguageToggle";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toastUtils } from "utils/toastUtils";

import { categoryApi } from "services/api";
import { getCategoryIconUrl } from "utils/apiUtils";

export default function EnhancedCategoryManagement() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [dlgOpen, setDlgOpen] = useState(false);
  const [draft, setDraft] = useState({ categoryId: null, nameVn: "", nameEn: "", code: "", icon: "" });
  const [iconFile, setIconFile] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRows = useCallback(async () => {
    try {
      setLoading(true);
      const response = await categoryApi.all();
      console.log('🔍 CategoryManagement: Categories response:', response);
      
      // Validate and filter the response
      if (Array.isArray(response)) {
        const validCategories = response.filter(cat => 
          cat && 
          typeof cat === 'object' && 
          (cat.categoryId || cat.id) && 
          cat.nameEn && 
          cat.nameVn
        );
        
        // Normalize categoryId field if needed
        const normalizedCategories = validCategories.map(cat => ({
          ...cat,
          categoryId: cat.categoryId || cat.id
        }));
        
        console.log('✅ CategoryManagement: Loaded', normalizedCategories.length, 'valid categories');
        setRows(normalizedCategories);
      } else {
        console.warn('⚠️ CategoryManagement: Invalid response format:', response);
        setRows([]);
      }
    } catch (error) {
      console.error('❌ CategoryManagement: Failed to fetch categories:', error);
      toast.error(t("failedToLoadData") || "Failed to load categories");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  // Cleanup any stuck toasts when component unmounts
  useEffect(() => {
    return () => {
      console.log('🔍 CategoryManagement: Component unmounting, dismissing any stuck toasts');
      toastUtils.dismissAll();
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchRows();
      toast.success(t("dataRefreshed") || "Data refreshed successfully");
    } catch (error) {
      toast.error(t("refreshFailed") || "Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  const reset = () => {
    setDraft({ categoryId: null, nameVn: "", nameEn: "", code: "", icon: "" });
    setIconFile(null);
  };

  // Compact header component with reduced spacing
  const EnhancedHeader = () => (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 2, 
        mb: 2, 
        borderRadius: 2,
        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
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
            <CategoryIcon fontSize="medium" />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
              {t("categoryManagement") || "Category Management"}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.875rem' }}>
              {t("manageCategoriesDescription") || "Manage product categories and classifications"}
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
            onClick={() => {
              reset();
              setDlgOpen(true);
            }}
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
            {t("addCategory") || "Add Category"}
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
          background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 50%, #4facfe 100%)',
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
            {t("categoryInventory") || "Category Inventory"}
          </Typography>
          <Chip 
            label={`${rows.length} ${t("categories") || "categories"}`}
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

  // Custom header component with beautiful gradient styling
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

  const save = async () => {
    if (!draft.nameEn.trim() || !draft.nameVn.trim()) {
      toast.warn(t("namesRequired") || "English and Vietnamese names required");
      return;
    }
    if (!draft.code.trim()) {
      toast.warn(t("codeRequired") || "Category code required");
      return;
    }
    
    console.log('🔍 CategoryManagement: Starting save operation with draft:', draft);
    
    try {
      let saved;
      const payload = { 
        nameVn: draft.nameVn, 
        nameEn: draft.nameEn, 
        code: draft.code 
      };
      
      console.log('🔍 CategoryManagement: Payload to send:', payload);
      
      if (draft.categoryId) {
        console.log('🔍 CategoryManagement: Updating existing category:', draft.categoryId);
        saved = await categoryApi.update(draft.categoryId, payload);
      } else {
        console.log('🔍 CategoryManagement: Creating new category');
        saved = await categoryApi.create(payload);
      }
      
      console.log('🔍 CategoryManagement: API response:', saved);
      
      // Validate the saved response
      if (!saved) {
        console.error('❌ CategoryManagement: API returned null/undefined response');
        throw new Error('API returned empty response');
      }
      
      if (typeof saved !== 'object') {
        console.error('❌ CategoryManagement: API response is not an object:', typeof saved);
        throw new Error(`Invalid response type: ${typeof saved}`);
      }
      
      // Handle different possible ID field names
      if (!saved.categoryId && !saved.id && !saved._id) {
        console.error('❌ CategoryManagement: API response missing ID field. Available fields:', Object.keys(saved));
        console.error('❌ CategoryManagement: Full response:', JSON.stringify(saved, null, 2));
        
        // Try to create a temporary ID if the save was successful but no ID returned
        if (saved.nameEn && saved.nameVn && saved.code) {
          console.warn('⚠️ CategoryManagement: Creating temporary ID for valid response without ID');
          saved = {
            ...saved,
            categoryId: `temp_${Date.now()}_${saved.code}`
          };
        } else {
          throw new Error('API response missing required ID field');
        }
      } else {
        // Normalize the ID field
        saved = {
          ...saved,
          categoryId: saved.categoryId || saved.id || saved._id
        };
      }
      
      console.log('✅ CategoryManagement: Normalized saved object:', saved);

      // Handle icon upload if present
      if (iconFile && saved?.categoryId) {
        const fd = new FormData();
        fd.append("file", iconFile);
        let tId = null;
        
        try {
          console.log('🔍 CategoryManagement: Starting icon upload for category:', saved.categoryId);
          
          tId = toastUtils.loading("Uploading icon…");
          
          const catWithIcon = await categoryApi.uploadIcon(saved.categoryId, fd);
          console.log('✅ CategoryManagement: Icon upload successful:', catWithIcon);
          
          toastUtils.updateToSuccess(tId, "Icon uploaded successfully!");
          
          // Update saved object with icon info if available
          if (catWithIcon && typeof catWithIcon === 'object') {
            saved = {
              ...saved,
              ...catWithIcon,
              categoryId: catWithIcon.categoryId || catWithIcon.id || saved.categoryId
            };
          }
          
        } catch (uploadError) {
          console.error('❌ CategoryManagement: Icon upload failed:', uploadError);
          
          const errorMessage = uploadError.response?.data?.message || uploadError.message || 'Unknown upload error';
          toastUtils.updateToError(tId, `Icon upload failed: ${errorMessage}`);
          
          // Continue without the icon - don't fail the entire save
          console.warn('⚠️ CategoryManagement: Continuing without icon due to upload failure');
        }
      }

      // Update the rows state
      setRows((prev) => {
        const exist = prev.find((x) => x?.categoryId === saved.categoryId);
        return exist
          ? prev.map((x) => (x?.categoryId === saved.categoryId ? saved : x))
          : [...prev, saved];
      });
      
      toast.success(draft.categoryId ? (t("categoryUpdated") || "Updated!") : (t("categoryAdded") || "Added!"));
      setDlgOpen(false);
      reset();
      
    } catch (e) {
      console.error('❌ CategoryManagement: Save failed:', e);
      
      // Provide more specific error messages
      let errorMessage = t("failedToSaveCategory") || 'Failed to save category';
      
      if (e.response?.status === 400) {
        errorMessage = e.response?.data?.message || (t("invalidData") || 'Invalid data provided');
      } else if (e.response?.status === 409) {
        errorMessage = t("categoryCodeExists") || 'Category code already exists';
      } else if (e.response?.status === 500) {
        errorMessage = t("serverError") || 'Server error - please try again';
      } else if (e.message) {
        errorMessage = e.message;
      }
      
      toast.error(errorMessage);
    }
  };

  const remove = async (id) => {
    if (!id) {
      console.error('❌ CategoryManagement: Cannot delete - no ID provided');
      toast.error(t("cannotDeleteInvalidId") || 'Cannot delete category - invalid ID');
      return;
    }
    
    if (!window.confirm(t("confirmDelete") || "Delete?")) return;
    
    try {
      console.log('🔍 CategoryManagement: Deleting category with ID:', id);
      await categoryApi.delete(id);
      setRows((r) => r.filter((x) => x?.categoryId !== id));
      toast.success(t("categoryDeleted") || "Deleted");
    } catch (e) {
      console.error('❌ CategoryManagement: Delete failed:', e);
      toast.error(e.response?.data?.message || e.message);
    }
  };

  const handleMenuClick = (event, category) => {
    setMenuAnchor(event.currentTarget);
    setSelectedCategory(category);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedCategory(null);
  };

  const handleViewProducts = () => {
    if (selectedCategory?.categoryId) {
      console.log('🔍 CategoryManagement: Navigating to products for category:', selectedCategory.categoryId);
      navigate(`/admin/product-management?categoryId=${selectedCategory.categoryId}`);
    } else {
      console.error('❌ CategoryManagement: Cannot view products - no valid category selected');
      toast.error(t("cannotViewProducts") || 'Cannot view products - invalid category');
    }
    handleMenuClose();
  };

  const columns = [
    {
      field: "icon",
      headerName: "",
      width: i18n.language === 'vi' ? 100 : 80,
      sortable: false,
      renderHeader: () => (
        <CustomColumnHeader 
          icon={CategoryIcon} 
          title={i18n.language === 'vi' ? 'Biểu tượng' : 'Icon'}
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
              src={row.icon && row.icon !== 'null' && row.icon !== 'undefined' ? getCategoryIconUrl(row.icon) : '/placeholder-prod.png'}
              alt={row.nameEn || 'Category'}
              style={{ 
                width: 56, 
                height: 56,
                objectFit: 'cover',
                borderRadius: '12px',
                border: '3px solid #4facfe',
                boxShadow: '0 4px 12px rgba(79, 172, 254, 0.2), 0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease-in-out',
                display: 'block'
              }}
              onError={(e) => {
                e.target.src = '/placeholder-prod.png';
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.1)';
                e.target.style.boxShadow = '0 8px 20px rgba(79, 172, 254, 0.3), 0 4px 8px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 4px 12px rgba(79, 172, 254, 0.2), 0 2px 4px rgba(0,0,0,0.1)';
              }}
            />
            {row.icon && row.icon !== 'null' && row.icon !== 'undefined' && (
              <Box sx={{
                position: 'absolute',
                top: -2,
                right: -2,
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
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
          title={i18n.language === 'vi' ? 'Mã' : 'Code'}
        />
      ),
      renderCell: ({ row }) => (
        <Chip
          label={row.code}
          variant="filled"
          sx={{ 
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.8rem',
            letterSpacing: '0.5px',
            borderRadius: '8px',
            height: '32px',
            boxShadow: '0 2px 8px rgba(79, 172, 254, 0.3)',
            border: '1px solid rgba(255,255,255,0.2)',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(79, 172, 254, 0.4)',
            },
            '& .MuiChip-label': {
              px: 2,
            }
          }}
        />
      )
    },
    { 
      field: "nameEn", 
      headerName: "",
      flex: 1,
      minWidth: 200,
      renderHeader: () => (
        <CustomColumnHeader 
          icon={LanguageIcon} 
          title={i18n.language === 'vi' ? 'Tên tiếng Anh' : 'English Name'}
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
          title={row.nameEn}
        >
          {row.nameEn}
        </Typography>
      )
    },
    { 
      field: "nameVn", 
      headerName: "",
      flex: 1,
      minWidth: 200,
      renderHeader: () => (
        <CustomColumnHeader 
          icon={LanguageIcon} 
          title={i18n.language === 'vi' ? 'Tên tiếng Việt' : 'Vietnamese Name'}
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
          title={row.nameVn}
        >
          {row.nameVn}
        </Typography>
      )
    },
    {
      field: "actions",
      headerName: "",
      width: 160,
      sortable: false,
      renderHeader: () => (
        <CustomColumnHeader 
          icon={ActionsIcon} 
          title={i18n.language === 'vi' ? 'Thao tác' : 'Actions'}
        />
      ),
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
          <Tooltip title={t("editCategory") || "Edit Category"} arrow>
            <IconButton
              size="small"
              onClick={() => {
                setDraft(row);
                setDlgOpen(true);
              }}
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
          <Tooltip title={t("deleteCategory") || "Delete Category"} arrow>
            <IconButton
              size="small"
              onClick={() => remove(row?.categoryId)}
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
          <Tooltip title={t("moreActions") || "More Actions"} arrow>
            <IconButton
              size="small"
              onClick={(e) => handleMenuClick(e, row)}
              sx={{
                width: 36,
                height: 36,
                background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
                color: 'white',
                boxShadow: '0 2px 8px rgba(156, 39, 176, 0.3)',
                border: '1px solid rgba(255,255,255,0.2)',
                '&:hover': { 
                  background: 'linear-gradient(135deg, #7b1fa2 0%, #4a148c 100%)',
                  transform: 'translateY(-2px) scale(1.05)',
                  boxShadow: '0 4px 12px rgba(156, 39, 176, 0.4)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  if (loading) {
    return (
      <AdminLayout titleKey="categoryManagement" icon="category">
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 2 }}>
          <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
            {t("loadingCategories") || "Loading categories..."}
          </Typography>
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout titleKey="categoryManagement" icon="category">
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
            getRowId={(r) => r?.categoryId || r?.id || Math.random()}
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
                background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                borderBottom: 'none',
                minHeight: '72px !important',
                boxShadow: '0 4px 20px rgba(79, 172, 254, 0.15)',
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
                  bgcolor: "rgba(79, 172, 254, 0.04)",
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.08), 0 4px 10px rgba(79, 172, 254, 0.1)',
                  '& .MuiDataGrid-cell': {
                    borderBottom: '1px solid rgba(79, 172, 254, 0.2)',
                  },
                },
                '&:nth-of-type(even)': {
                  bgcolor: 'rgba(248, 250, 252, 0.5)',
                },
                '&.Mui-selected': {
                  bgcolor: 'rgba(79, 172, 254, 0.08)',
                  '&:hover': {
                    bgcolor: 'rgba(79, 172, 254, 0.12)',
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

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
            border: '1px solid rgba(0,0,0,0.08)',
            minWidth: 220,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          }
        }}
      >
        <MenuItem onClick={handleViewProducts} sx={{ py: 1.5, px: 2 }}>
          <ListItemIcon>
            <InventoryIcon fontSize="small" sx={{ color: 'primary.main' }} />
          </ListItemIcon>
          <ListItemText 
            primary={t("viewProducts") || "View Products"}
            primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}
          />
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={() => {
          if (selectedCategory) {
            setDraft(selectedCategory);
            setDlgOpen(true);
          } else {
            toast.error(t("cannotEditInvalidCategory") || 'Cannot edit - invalid category');
          }
          handleMenuClose();
        }} sx={{ py: 1.5, px: 2 }}>
          <ListItemIcon>
            <EditIcon fontSize="small" sx={{ color: 'info.main' }} />
          </ListItemIcon>
          <ListItemText 
            primary={t("editCategory") || "Edit"}
            primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}
          />
        </MenuItem>
        <MenuItem onClick={() => {
          remove(selectedCategory?.categoryId);
          handleMenuClose();
        }} sx={{ py: 1.5, px: 2 }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText 
            primary={t("deleteCategory") || "Delete"}
            primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem', color: 'error.main' }}
          />
        </MenuItem>
      </Menu>

      {/* Add/Edit Dialog */}
      <Dialog
        open={dlgOpen}
        onClose={() => {
          setDlgOpen(false);
          reset();
        }}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          }
        }}
      >
        <DialogTitle sx={{ 
          background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          py: 3,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
          }
        }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', zIndex: 1 }}>
            <CategoryIcon />
          </Avatar>
          <Typography variant="h6" fontWeight="bold" sx={{ zIndex: 1 }}>
            {draft.categoryId
              ? (t("editCategory") || "Edit Category")
              : (t("addCategory") || "Add Category")}
          </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 4 }}>
          <Stack spacing={3}>
            <TextField
              label={t("categoryCode") || "Category Code"}
              value={draft.code}
              onChange={(e) => setDraft({ ...draft, code: e.target.value })}
              autoFocus
              fullWidth
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: '1.1rem',
                  '& fieldset': {
                    borderWidth: 2,
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                  },
                },
                '& .MuiInputLabel-root': {
                  fontSize: '1.1rem',
                  fontWeight: 500,
                },
              }}
              placeholder={t("enterCategoryCode") || "Enter category code"}
            />
            
            <TextField
              label={t("englishName") || "English Name"}
              value={draft.nameEn}
              onChange={(e) => setDraft({ ...draft, nameEn: e.target.value })}
              fullWidth
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: '1.1rem',
                  '& fieldset': {
                    borderWidth: 2,
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                  },
                },
                '& .MuiInputLabel-root': {
                  fontSize: '1.1rem',
                  fontWeight: 500,
                },
              }}
              placeholder={t("enterEnglishName") || "Enter English name"}
            />
            
            <TextField
              label={t("vietnameseName") || "Vietnamese Name"}
              value={draft.nameVn}
              onChange={(e) => setDraft({ ...draft, nameVn: e.target.value })}
              fullWidth
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: '1.1rem',
                  '& fieldset': {
                    borderWidth: 2,
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                  },
                },
                '& .MuiInputLabel-root': {
                  fontSize: '1.1rem',
                  fontWeight: 500,
                },
              }}
              placeholder={t("enterVietnameseName") || "Enter Vietnamese name"}
            />
            
            <Box>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                {t("categoryIcon") || "Category Icon"}
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
                sx={{
                  borderRadius: 2,
                  borderWidth: 2,
                  borderStyle: 'dashed',
                  py: 2,
                  px: 3,
                  fontSize: '1rem',
                  '&:hover': {
                    borderWidth: 2,
                    borderStyle: 'dashed',
                  }
                }}
                fullWidth
              >
                {iconFile?.name || (t("chooseIcon") || "Choose icon...")}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => setIconFile(e.target.files[0])}
                />
              </Button>
            </Box>
            
            {(iconFile || (draft.icon && draft.icon !== 'null' && draft.icon !== 'undefined')) && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Avatar
                  src={
                    iconFile
                      ? URL.createObjectURL(iconFile)
                      : (draft.icon && draft.icon !== 'null' && draft.icon !== 'undefined') 
                        ? getCategoryIconUrl(draft.icon)
                        : undefined
                  }
                  sx={{ 
                    width: 80, 
                    height: 80,
                    border: '3px solid',
                    borderColor: 'primary.main',
                    boxShadow: 4
                  }}
                >
                  {(!iconFile && (!draft.icon || draft.icon === 'null' || draft.icon === 'undefined')) && (
                    <CategoryIcon sx={{ fontSize: 40 }} />
                  )}
                </Avatar>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2, background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
          <Button
            onClick={() => {
              setDlgOpen(false);
              reset();
            }}
            variant="outlined"
            size="large"
            sx={{ 
              borderRadius: 2,
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2,
              }
            }}
          >
            {t("cancel") || "Cancel"}
          </Button>
          <Button 
            onClick={save} 
            variant="contained"
            size="large"
            sx={{ 
              borderRadius: 2,
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              boxShadow: '0 4px 15px rgba(79, 172, 254, 0.3)',
              '&:hover': {
                background: "linear-gradient(135deg, #29b6f6 0%, #00e5ff 100%)",
                boxShadow: '0 6px 20px rgba(79, 172, 254, 0.4)',
                transform: 'translateY(-1px)',
              }
            }}
          >
            {t("save") || "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}