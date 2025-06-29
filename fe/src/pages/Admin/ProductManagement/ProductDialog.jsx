import {
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Button,
  Box,
  Typography,
  Avatar,
  Stack,
} from "@mui/material";
import {
  Inventory as InventoryIcon,
  UploadFile as UploadIcon,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getProductImageUrl } from "utils/apiUtils";
import MDButton from "components/template/MDButton";

export default function ProductDialog({
  open, 
  onClose, 
  onSave, 
  product, 
  units = [], 
  categories = []
}) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState({
    code: "",
    name: "",
    unitId: "",
    categoryId: "",
    image: ""
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    setDraft(product ? {
      code: product.code || "",
      name: product.name || "",
      unitId: product.unitId || "",
      categoryId: product.categoryId || "",
      image: product.image || ""
    } : {
      code: "",
      name: "",
      unitId: "",
      categoryId: "",
      image: ""
    });
    setImageFile(null);
  }, [product]);

  const handleSave = () => {
    // Validation
    if (!draft.code?.trim()) {
      return;
    }
    if (!draft.name?.trim()) {
      return;
    }
    
    onSave(draft, imageFile);
  };

  const resetForm = () => {
    setDraft({
      code: "",
      name: "",
      unitId: "",
      categoryId: "",
      image: ""
    });
    setImageFile(null);
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        onClose();
        resetForm();
      }}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        }
      }}
    >
      <DialogTitle sx={{ 
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        py: 3
      }}>
        <Avatar sx={{ bgcolor: 'rgba(205, 228, 101, 0.2)' }}>
          <InventoryIcon />
        </Avatar>
        <Typography variant="h6" fontWeight="bold">
          {product
            ? (t("editProduct") || "Edit Product")
            : (t("addProduct") || "Add Product")
          }
        </Typography>
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 4 }}>
        <Stack spacing={3}>
          <TextField
            fullWidth
            autoFocus
            label={t("productCode") || "Product Code"}
            value={draft.code}
            onChange={(e) => setDraft({ ...draft, code: e.target.value })}
            placeholder={t("enterProductCode") || "Enter product code"}
            required
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
          />
          
          <TextField
            fullWidth
            label={t("productName") || "Product Name"}
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder={t("enterProductName") || "Enter product name"}
            required
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
          />

          <FormControl 
            fullWidth 
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: '1.1rem',
                minHeight: '56px', // Match TextField height
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
              '& .MuiSelect-select': {
                padding: '16.5px 14px', // Match TextField padding
                fontSize: '1.1rem',
              },
            }}
          >
            <InputLabel>{t("unit") || "Unit"}</InputLabel>
            <Select
              value={draft.unitId}
              label={t("unit") || "Unit"}
              onChange={(e) => setDraft({ ...draft, unitId: e.target.value })}
            >
              <MenuItem value="">
                <em>{t("selectUnit") || "Select Unit"}</em>
              </MenuItem>
              {units.map((unit) => (
                <MenuItem key={unit.unitId || unit.id} value={unit.unitId || unit.id}>
                  {unit.nameEn || unit.unitName || unit.name}
                  {unit.nameVn && ` (${unit.nameVn})`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl 
            fullWidth 
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: '1.1rem',
                minHeight: '56px', // Match TextField height
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
              '& .MuiSelect-select': {
                padding: '16.5px 14px', // Match TextField padding
                fontSize: '1.1rem',
              },
            }}
          >
            <InputLabel>{t("category") || "Category"}</InputLabel>
            <Select
              value={draft.categoryId}
              label={t("category") || "Category"}
              onChange={(e) => setDraft({ ...draft, categoryId: e.target.value })}
            >
              <MenuItem value="">
                <em>{t("selectCategory") || "Select Category"}</em>
              </MenuItem>
              {categories.map((category) => {
                // Handle category name properly
                let categoryName = 'Unknown Category';
                if (typeof category.nameEn === 'string') {
                  categoryName = category.nameEn;
                } else if (typeof category.nameEn === 'object' && category.nameEn) {
                  categoryName = category.nameEn.en || category.nameEn.nameEn || category.nameEn.name || 'Unknown Category';
                } else if (category.categoryName) {
                  categoryName = category.categoryName;
                } else if (category.name) {
                  categoryName = category.name;
                }

                // Handle Vietnamese name
                let vietnameseName = '';
                if (category.nameVn && typeof category.nameVn === 'string') {
                  vietnameseName = ` (${category.nameVn})`;
                }

                return (
                  <MenuItem key={category.categoryId || category.id} value={category.categoryId || category.id}>
                    {categoryName}{vietnameseName}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          
          <Box>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              {t("productImage") || "Product Image"}
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
              {imageFile?.name || (t("chooseImage") || "Choose image...")}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
              />
            </Button>
          </Box>
          
          {(imageFile || draft.image) && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Avatar
                src={
                  imageFile
                    ? URL.createObjectURL(imageFile)
                    : draft.image ? getProductImageUrl(draft.image) : undefined
                }
                sx={{ 
                  width: 80, 
                  height: 80,
                  border: '3px solid',
                  borderColor: 'primary.main',
                  boxShadow: 2
                }}
              />
            </Box>
          )}
        </Stack>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, gap: 2 }}>
        <MDButton
          variant="outlined"
          color="secondary"
          size="large"
          onClick={() => {
            onClose();
            resetForm();
          }}
          sx={{ 
            borderRadius: 2,
            px: 4,
            py: 1.5,
            fontSize: '1rem'
          }}
        >
          {t("cancel") || "Cancel"}
        </MDButton>
        <MDButton
          variant="gradient"
          color="primary"
          size="large"
          onClick={handleSave}
          sx={{ 
            borderRadius: 2,
            px: 4,
            py: 1.5,
            fontSize: '1rem',
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            '&:hover': {
              background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
            }
          }}
        >
          {t("save") || "Save"}
        </MDButton>
      </DialogActions>
    </Dialog>
  );
}
  