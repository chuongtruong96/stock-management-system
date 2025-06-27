import { useState, useEffect, useContext } from "react";
import {
  Box,
  Button,
  Typography,
  Avatar,
  CircularProgress,
  Alert,
  IconButton,
} from "@mui/material";
import {
  Inventory as InventoryIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import AdminLayout from "layouts/AdminLayout";

import { WsContext } from "context/WsContext";
import { productApi, unitApi, categoryApi } from "services/api";

import ProductDialog from "./ProductDialog";

export default function ProductManagement({ language = "en" }) {
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [units, setUnits] = useState([]);
  const [categories, setCategories] = useState([]);

  const [dlgOpen, setDlgOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { subscribe } = useContext(WsContext);

  useEffect(() => {
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

    fetchData();
  }, [t]);

  const openAdd = () => {
    setEditRow(null);
    setDlgOpen(true);
  };
  
  const openEdit = (r) => {
    setEditRow(r);
    setDlgOpen(true);
  };

  // Get category name by ID
  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.categoryId === categoryId);
    return category ? (language === "vi" ? category.nameVn : category.nameEn) : "—";
  };

  // Get unit name by ID
  const getUnitName = (unitId) => {
    const unit = units.find(u => u.id === unitId);
    return unit ? (language === "vi" ? unit.nameVn : unit.nameEn) : "—";
  };

  // Define columns for DataGrid
  const columns = [
    {
      field: "image",
      headerName: "Image",
      width: 80,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          {row.image && row.image !== 'null' ? (
            <img 
              src={`/assets/prod/${row.image}`}
              alt={row.name}
              style={{ 
                width: 48, 
                height: 48,
                objectFit: 'cover',
                borderRadius: '8px',
                border: '2px solid #1976d2',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <Avatar 
            sx={{ 
              width: 48, 
              height: 48,
              border: '2px solid',
              borderColor: 'primary.main',
              boxShadow: 2,
              display: row.image && row.image !== 'null' ? 'none' : 'flex',
              bgcolor: 'primary.main'
            }}
          >
            <InventoryIcon />
          </Avatar>
        </Box>
      ),
    },
    {
      field: "code",
      headerName: "Code",
      width: 120,
      renderCell: ({ row }) => (
        <Typography variant="body2" sx={{ 
          bgcolor: 'grey.100', 
          px: 1.5, 
          py: 0.5, 
          borderRadius: 1,
          fontWeight: 600,
          color: 'primary.main'
        }}>
          {row.code}
        </Typography>
      )
    },
    { 
      field: "name", 
      headerName: "Product Name", 
      flex: 1,
      minWidth: 200,
      renderCell: ({ row }) => (
        <Typography variant="body2" fontWeight="500">
          {row.name}
        </Typography>
      )
    },
    { 
      field: "category", 
      headerName: "Category", 
      width: 150,
      renderCell: ({ row }) => (
        <Typography variant="body2" fontWeight="500">
          {getCategoryName(row.categoryId)}
        </Typography>
      )
    },
    { 
      field: "unit", 
      headerName: "Unit", 
      width: 120,
      renderCell: ({ row }) => (
        <Typography variant="body2" fontWeight="500">
          {getUnitName(row.unitId)}
        </Typography>
      )
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            color="info"
            size="small"
            onClick={() => openEdit(row)}
            sx={{
              bgcolor: 'info.50',
              '&:hover': { bgcolor: 'info.100' }
            }}
          >
            <EditIcon fontSize="inherit" />
          </IconButton>
          <IconButton
            color="error"
            size="small"
            onClick={() => handleDelete(row.id)}
            sx={{
              bgcolor: 'error.50',
              '&:hover': { bgcolor: 'error.100' }
            }}
          >
            <DeleteIcon fontSize="inherit" />
          </IconButton>
        </Box>
      ),
    },
  ];

  const saveProduct = async (draft) => {
    try {
      if (editRow) {
        const response = await productApi.update(editRow.id, draft);
        setRows((p) => p.map((r) => (r.id === response.id ? response : r)));
      } else {
        const response = await productApi.add(draft);
        setRows((p) => [...p, response]);
      }
      setDlgOpen(false);
      toast.success(editRow ? (t("productUpdated") || "Product updated") : (t("productAdded") || "Product added"));
    } catch (e) {
      console.error("Save error:", e);
      toast.error(e.response?.data?.message || e.message || "Save error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("confirmDeleteProduct") || "Are you sure you want to delete this product?"))
      return;
    try {
      await productApi.delete(id);
      setRows((p) => p.filter((r) => r.id !== id));
      toast.success(t("productDeleted") || "Product deleted");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || error.message || "Delete error");
    }
  };

  if (error) {
    return (
      <AdminLayout titleKey="productManagement" icon="inventory">
        <Box sx={{ p: 3 }}>
          <Alert severity="error">
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

  return (
    <AdminLayout titleKey="productManagement" icon="inventory">
      <Box sx={{ px: 0, py: 1 }}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
          sx={{ 
            p: 2, 
            mx: 1,
            borderRadius: 2, 
            bgcolor: 'background.paper',
            boxShadow: 1
          }}
        >
          <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <InventoryIcon />
            </Avatar>
            {t("productManagement") || "Product Management"}
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={openAdd}
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1.5,
              fontSize: '1rem'
            }}
          >
            {t("addProduct") || "Add Product"}
          </Button>
        </Box>
        
        <Box sx={{ 
          height: 600, 
          width: "100%",
          bgcolor: 'background.paper',
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: 1,
          mx: 1,
        }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
              <CircularProgress />
            </Box>
          ) : (
            <DataGrid
              rows={rows}
              columns={columns}
              getRowId={(r) => r.id}
              slots={{ toolbar: GridToolbar }}
              disableRowSelectionOnClick
              rowHeight={80}
              sx={{
                border: 'none',
                "& .MuiDataGrid-root": {
                  border: 'none',
                },
                "& .MuiDataGrid-cell": {
                  borderBottom: '1px solid #f0f0f0',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                },
                "& .MuiDataGrid-columnHeaders": { 
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  minHeight: '56px !important',
                },
                "& .MuiDataGrid-columnHeaderTitle": {
                  fontWeight: 'bold',
                },
                "& .MuiDataGrid-row": {
                  minHeight: '80px !important',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': { 
                    bgcolor: "rgba(25, 118, 210, 0.04)",
                    transform: 'translateY(-1px)',
                  },
                },
                "& .MuiDataGrid-toolbarContainer": {
                  padding: '16px',
                  borderBottom: '1px solid #e0e0e0',
                  bgcolor: '#fafafa',
                },
              }}
            />
          )}
        </Box>
      </Box>
      
      <ProductDialog
        open={dlgOpen}
        onClose={() => setDlgOpen(false)}
        onSave={saveProduct}
        product={editRow}
        units={units}
        categories={categories}
      />
    </AdminLayout>
  );
}