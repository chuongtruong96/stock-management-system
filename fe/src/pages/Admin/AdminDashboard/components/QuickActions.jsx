import { memo } from "react";
import { Grid, Card, Typography, Box, alpha, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Assignment as OrderIcon,
  Inventory as ProductIcon,
  People as UserIcon,
  Category as CategoryIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";

const QuickActionCard = memo(({ icon: Icon, title, description, onClick, color = "primary" }) => {
  const theme = useTheme();
  
  // Safe color access
  const getColor = (colorName) => {
    if (!theme?.palette) return '#1976d2';
    
    const colorMap = {
      primary: theme.palette.primary?.main || '#1976d2',
      secondary: theme.palette.secondary?.main || '#dc004e',
      success: theme.palette.success?.main || '#2e7d32',
      error: theme.palette.error?.main || '#d32f2f',
      warning: theme.palette.warning?.main || '#ed6c02',
      info: theme.palette.info?.main || '#0288d1',
      default: theme.palette.grey?.[600] || '#757575',
    };
    
    return colorMap[colorName] || colorMap.primary;
  };
  
  const cardColor = getColor(color);
  const backgroundPaper = theme?.palette?.background?.paper || '#ffffff';
  const textPrimary = theme?.palette?.text?.primary || '#000000';
  const textSecondary = theme?.palette?.text?.secondary || '#666666';
  
  return (
    <Card
      onClick={onClick}
      sx={{
        p: 2.5,
        borderRadius: 2,
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        background: `linear-gradient(135deg, ${alpha(cardColor, 0.05)} 0%, ${alpha(backgroundPaper, 0.9)} 100%)`,
        border: `1px solid ${alpha(cardColor, 0.1)}`,
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: theme?.shadows?.[4] || '0 4px 12px rgba(0,0,0,0.1)',
          border: `1px solid ${alpha(cardColor, 0.3)}`,
          background: `linear-gradient(135deg, ${alpha(cardColor, 0.1)} 0%, ${alpha(backgroundPaper, 0.9)} 100%)`,
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ color: textPrimary }}>
            {title}
          </Typography>
          <Typography variant="caption" sx={{ color: textSecondary }}>
            {description}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
});

QuickActionCard.displayName = "QuickActionCard";

const QuickActions = memo(() => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const textPrimary = theme?.palette?.text?.primary || '#000000';

  const quickActions = [
    {
      icon: OrderIcon,
      title: "Manage Orders",
      description: "View and process pending orders",
      onClick: () => navigate("/order-management"),
      color: "primary",
    },
    {
      icon: ProductIcon,
      title: "Add Product",
      description: "Add new product to inventory",
      onClick: () => navigate("/product-management"),
      color: "success",
    },
    {
      icon: UserIcon,
      title: "Manage Users",
      description: "Add or edit system users",
      onClick: () => navigate("/user-management"),
      color: "info",
    },
    {
      icon: CategoryIcon,
      title: "Manage Categories",
      description: "Organize product categories",
      onClick: () => navigate("/category-management"),
      color: "warning",
    },
    {
      icon: ReportIcon,
      title: "View Reports",
      description: "Analytics and insights",
      onClick: () => navigate("/reports"),
      color: "secondary",
    },
    {
      icon: SettingsIcon,
      title: "System Settings",
      description: "Configure system settings",
      onClick: () => navigate("/unit-management"),
      color: "default",
    },
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 2, color: textPrimary }}>
        Quick Actions
      </Typography>
      <Grid container spacing={2}>
        {quickActions.map((action, index) => (
          <Grid key={index} item xs={12} sm={6} md={4} lg={2}>
            <QuickActionCard {...action} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
});

QuickActions.displayName = "QuickActions";

export default QuickActions;