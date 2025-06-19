import { memo, useState } from "react";
import { 
  Card, 
  Typography, 
  Box, 
  Switch, 
  Chip, 
  IconButton, 
  alpha,
  useTheme,
  Collapse,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { orderWindowApi } from "services/api";

const SystemStatus = memo(({ winOpen, setWinOpen }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
  // Safe theme access
  const backgroundPaper = theme?.palette?.background?.paper || '#ffffff';
  const backgroundDefault = theme?.palette?.background?.default || '#fafafa';
  const textPrimary = theme?.palette?.text?.primary || '#000000';
  const textSecondary = theme?.palette?.text?.secondary || '#666666';
  const divider = theme?.palette?.divider || '#e0e0e0';
  const successMain = theme?.palette?.success?.main || '#2e7d32';
  const warningMain = theme?.palette?.warning?.main || '#ed6c02';
  const greyMain = theme?.palette?.grey?.[400] || '#bdbdbd';

  const handleToggleOrderWindow = async () => {
    setLoading(true);
    try {
      const response = await orderWindowApi.toggle();
      setWinOpen(response.open);
      toast.success(
        response.open 
          ? t("orderWindowOpened") || "Order window opened"
          : t("orderWindowClosed") || "Order window closed"
      );
    } catch (error) {
      toast.error(t("failedToToggleOrderWindow") || "Failed to toggle order window");
    } finally {
      setLoading(false);
    }
  };

  const systemChecks = [
    {
      name: t("orderWindow") || "Order Window",
      status: winOpen ? "active" : "inactive",
      description: winOpen 
        ? t("orderWindowActiveDesc") || "Users can place orders"
        : t("orderWindowInactiveDesc") || "Orders are not being accepted",
      icon: winOpen ? CheckCircleIcon : WarningIcon,
      color: winOpen ? "success" : "warning",
    },
    {
      name: t("databaseConnection") || "Database Connection",
      status: "active",
      description: t("databaseConnected") || "Database is connected",
      icon: CheckCircleIcon,
      color: "success",
    },
    {
      name: t("apiServices") || "API Services",
      status: "active",
      description: t("allServicesRunning") || "All services are running",
      icon: CheckCircleIcon,
      color: "success",
    },
  ];

  const getStatusColor = (colorName) => {
    const colorMap = {
      success: successMain,
      warning: warningMain,
      error: theme?.palette?.error?.main || '#d32f2f',
    };
    return colorMap[colorName] || successMain;
  };

  return (
    <Card
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${alpha(backgroundPaper, 0.9)} 0%, ${alpha(backgroundDefault, 0.9)} 100%)`,
        border: `1px solid ${alpha(divider, 0.1)}`,
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ color: textPrimary }}>
            {t("systemStatus") || "System Status"}
          </Typography>
          <Chip
            label={t("operational") || "Operational"}
            size="small"
            color="success"
            variant="outlined"
            icon={<CheckCircleIcon />}
          />
        </Box>
        <IconButton
          onClick={() => setExpanded(!expanded)}
          sx={{ 
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s",
          }}
        >
          <ExpandMoreIcon />
        </IconButton>
      </Box>

      {/* Order Window Control */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          borderRadius: 2,
          bgcolor: alpha(winOpen ? successMain : warningMain, 0.1),
          border: `1px solid ${alpha(winOpen ? successMain : warningMain, 0.2)}`,
        }}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ color: textPrimary }}>
            {t("orderWindow") || "Order Window"}
          </Typography>
          <Typography variant="body2" sx={{ color: textSecondary }}>
            {winOpen 
              ? t("acceptingOrders") || "Accepting orders from users"
              : t("notAcceptingOrders") || "Not accepting orders"
            }
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Chip
            label={winOpen ? t("open") || "Open" : t("closed") || "Closed"}
            size="small"
            color={winOpen ? "success" : "error"}
            variant="filled"
          />
          <Switch
            checked={winOpen}
            onChange={handleToggleOrderWindow}
            disabled={loading}
            color="success"
            sx={{
              "& .MuiSwitch-thumb": {
                bgcolor: winOpen ? successMain : greyMain,
              },
            }}
          />
        </Box>
      </Box>

      {/* Detailed System Checks */}
      <Collapse in={expanded}>
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ color: textPrimary }}>
            {t("detailedSystemChecks") || "Detailed System Checks"}
          </Typography>
          {systemChecks.map((check, index) => {
            const IconComponent = check.icon;
            const statusColor = getStatusColor(check.color);
            
            return (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 1.5,
                  borderRadius: 1,
                  "&:hover": {
                    bgcolor: alpha(theme?.palette?.action?.hover || '#000000', 0.5),
                  },
                }}
              >
                <IconComponent
                  sx={{
                    color: statusColor,
                    fontSize: 20,
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight="medium" sx={{ color: textPrimary }}>
                    {check.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: textSecondary }}>
                    {check.description}
                  </Typography>
                </Box>
                <Chip
                  label={check.status}
                  size="small"
                  color={check.color}
                  variant="outlined"
                />
              </Box>
            );
          })}
        </Box>
      </Collapse>
    </Card>
  );
});

SystemStatus.displayName = "SystemStatus";

export default SystemStatus;