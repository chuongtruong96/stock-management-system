import { memo } from "react";
import { Grid, Box, Card, Typography, IconButton, alpha, useTheme } from "@mui/material";
import { Link } from "react-router-dom";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";

const MetricCard = memo(({ card }) => {
  const theme = useTheme();
  
  // Safe color access with fallbacks
  const getCardColor = (colorName) => {
    if (!colorName || !theme?.palette) return '#1976d2';
    
    const colorMap = {
      primary: theme.palette.primary?.main || '#1976d2',
      secondary: theme.palette.secondary?.main || '#dc004e',
      success: theme.palette.success?.main || '#2e7d32',
      error: theme.palette.error?.main || '#d32f2f',
      warning: theme.palette.warning?.main || '#ed6c02',
      info: theme.palette.info?.main || '#0288d1',
    };
    
    return colorMap[colorName] || theme.palette.primary?.main || '#1976d2';
  };
  
  const getPercentageColor = (colorName) => {
    if (!colorName || !theme?.palette) return theme?.palette?.text?.secondary || '#666';
    
    const colorMap = {
      primary: theme.palette.primary?.main || '#1976d2',
      secondary: theme.palette.secondary?.main || '#dc004e',
      success: theme.palette.success?.main || '#2e7d32',
      error: theme.palette.error?.main || '#d32f2f',
      warning: theme.palette.warning?.main || '#ed6c02',
      info: theme.palette.info?.main || '#0288d1',
    };
    
    return colorMap[colorName] || theme?.palette?.text?.secondary || '#666';
  };
  
  const cardColor = getCardColor(card.color);
  const backgroundPaper = theme?.palette?.background?.paper || '#ffffff';
  const textPrimary = theme?.palette?.text?.primary || '#000000';
  const textSecondary = theme?.palette?.text?.secondary || '#666666';
  const successMain = theme?.palette?.success?.main || '#2e7d32';
  const errorMain = theme?.palette?.error?.main || '#d32f2f';
  
  const cardContent = (
    <Card
      elevation={3}
      sx={{
        p: 3,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${alpha(cardColor, 0.1)} 0%, ${alpha(backgroundPaper, 0.9)} 100%)`,
        border: `1px solid ${alpha(cardColor, 0.2)}`,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: card.route ? "pointer" : "default",
        "&:hover": card.route ? {
          transform: "translateY(-4px)",
          boxShadow: theme?.shadows?.[8] || '0 8px 32px rgba(0,0,0,0.12)',
          border: `1px solid ${alpha(cardColor, 0.4)}`,
        } : {},
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha(cardColor, 0.2),
              color: cardColor,
            }}
          >
            <i className="material-icons" style={{ fontSize: 24 }}>
              {card.icon}
            </i>
          </Box>
          {card.trend && (
            <Box sx={{ ml: 1 }}>
              {card.trend === "up" ? (
                <TrendingUpIcon sx={{ color: successMain, fontSize: 20 }} />
              ) : (
                <TrendingDownIcon sx={{ color: errorMain, fontSize: 20 }} />
              )}
            </Box>
          )}
        </Box>
        {card.route && (
          <IconButton 
            size="small" 
            sx={{ 
              color: cardColor,
              opacity: 0.7,
              "&:hover": { opacity: 1 }
            }}
          >
            <ArrowForwardIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: textPrimary }}>
        {typeof card.count === "number" ? card.count.toLocaleString() : card.count}
      </Typography>

      <Typography variant="body1" color={textPrimary} gutterBottom>
        {card.title}
      </Typography>

      {card.percentage && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
          <Typography
            variant="body2"
            sx={{
              color: getPercentageColor(card.percentage.color),
              fontWeight: 600,
            }}
          >
            {card.percentage.amount}
          </Typography>
          <Typography variant="body2" sx={{ color: textSecondary }}>
            {card.percentage.label}
          </Typography>
        </Box>
      )}
    </Card>
  );

  return card.route ? (
    <Link to={card.route} style={{ textDecoration: "none" }}>
      {cardContent}
    </Link>
  ) : (
    cardContent
  );
});

MetricCard.displayName = "MetricCard";

const DashboardMetrics = memo(({ cards = [] }) => {
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {cards.map((card, index) => (
        <Grid key={card?.title || index} item xs={12} sm={6} lg={3}>
          <MetricCard card={card || {}} />
        </Grid>
      ))}
    </Grid>
  );
});

DashboardMetrics.displayName = "DashboardMetrics";

export default DashboardMetrics;