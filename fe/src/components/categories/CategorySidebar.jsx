import { 
  List, 
  ListItemButton, 
  ListItemText, 
  ListSubheader, 
  Badge, 
  Box, 
  Paper,
  Typography,
  Skeleton,
  Stack,
  Chip,
  Avatar,
  Divider,
} from "@mui/material";
import {
  Category as CategoryIcon,
  Inventory as AllProductsIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { getCategoryNameSimple } from "utils/categoryNameUtils";

export default function CategorySidebar({ 
  list = [], 
  active = [], 
  onSelect, 
  sticky = true, 
  loading = false 
}) {
  const { t, i18n } = useTranslation();
  const total = list.reduce((s, c) => s + (c.productCount ?? 0), 0) || list.length;
  const isAll = active.length === 0;
  const sxSticky = sticky ? { position: "sticky", top: 120 } : {};

  if (loading) {
    return (
      <Box sx={sxSticky}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Skeleton variant="text" width={120} height={24} />
          </Box>
          <Box sx={{ p: 1 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                height={48}
                sx={{ mb: 1, borderRadius: 2 }}
              />
            ))}
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={sxSticky}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,249,250,0.9) 100%)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2.5,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                width: 32,
                height: 32,
              }}
            >
              <CategoryIcon fontSize="small" />
            </Avatar>
            <Typography variant="h6" fontWeight={600}>
              {t('category.categories')}
            </Typography>
          </Stack>
        </Box>

        <List
          sx={{
            p: 1,
            maxHeight: "calc(75vh - 80px)",
            overflow: "auto",
            '&::-webkit-scrollbar': {
              width: 6,
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(0,0,0,0.2)',
              borderRadius: 3,
            },
          }}
        >
          {/* All Products */}
          <ListItemButton
            selected={isAll}
            onClick={() => onSelect(null)}
            sx={{
              borderRadius: 2,
              mb: 1,
              transition: 'all 0.2s ease-in-out',
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
                '& .MuiBadge-badge': {
                  bgcolor: 'white',
                  color: 'primary.main',
                },
              },
              '&:hover': {
                bgcolor: 'action.hover',
                transform: 'translateX(4px)',
              },
            }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                mr: 2,
                bgcolor: isAll ? 'rgba(255,255,255,0.2)' : 'primary.light',
                fontSize: '0.875rem',
              }}
            >
              <AllProductsIcon fontSize="small" />
            </Avatar>
            <ListItemText
              primary={t('category.allProducts')}
              primaryTypographyProps={{
                fontWeight: isAll ? 600 : 500,
                fontSize: '0.9rem',
              }}
            />
            <Badge
              badgeContent={total}
              color={isAll ? "default" : "primary"}
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '0.75rem',
                  minWidth: 20,
                  height: 20,
                  fontWeight: 600,
                },
              }}
            />
          </ListItemButton>

          <Divider sx={{ my: 1 }} />

          {/* Category Items */}
          {list.map((c) => {
            const selected = active.includes(c.categoryId);
            const categoryName = getCategoryNameSimple(c, i18n.language);
            
            return (
              <ListItemButton
                key={c.categoryId}
                selected={selected}
                onClick={() => onSelect(c.categoryId)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  transition: 'all 0.2s ease-in-out',
                  '&.Mui-selected': {
                    bgcolor: 'secondary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'secondary.dark',
                    },
                    '& .MuiBadge-badge': {
                      bgcolor: 'white',
                      color: 'secondary.main',
                    },
                  },
                  '&:hover': {
                    bgcolor: 'action.hover',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 28,
                    height: 28,
                    mr: 2,
                    bgcolor: selected ? 'rgba(255,255,255,0.2)' : 'grey.200',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  {categoryName.charAt(0).toUpperCase()}
                </Avatar>
                <ListItemText
                  primary={categoryName}
                  primaryTypographyProps={{
                    fontWeight: selected ? 600 : 500,
                    fontSize: '0.875rem',
                  }}
                />
                {c.productCount !== undefined && (
                  <Badge
                    badgeContent={c.productCount}
                    color={selected ? "default" : "secondary"}
                    sx={{
                      '& .MuiBadge-badge': {
                        fontSize: '0.7rem',
                        minWidth: 18,
                        height: 18,
                        fontWeight: 600,
                      },
                    }}
                  />
                )}
              </ListItemButton>
            );
          })}
        </List>

        {/* Footer */}
        <Box
          sx={{
            p: 2,
            bgcolor: 'grey.50',
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="caption" color="text.secondary" textAlign="center">
            {list.length} {list.length === 1 ? 'category' : 'categories'} available
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}