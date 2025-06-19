import { memo } from "react";
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Divider,
  IconButton,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Assignment as OrderIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  Schedule as PendingIcon,
  MoreVert as MoreIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const ActivityItem = memo(({ order, index, total }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // Safe theme access
  const backgroundPaper = theme?.palette?.background?.paper || '#ffffff';
  const textPrimary = theme?.palette?.text?.primary || '#000000';
  const textSecondary = theme?.palette?.text?.secondary || '#666666';
  const successMain = theme?.palette?.success?.main || '#2e7d32';
  const errorMain = theme?.palette?.error?.main || '#d32f2f';
  const warningMain = theme?.palette?.warning?.main || '#ed6c02';
  const infoMain = theme?.palette?.info?.main || '#0288d1';
  const primaryMain = theme?.palette?.primary?.main || '#1976d2';

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return <ApprovedIcon sx={{ color: successMain }} />;
      case "rejected":
        return <RejectedIcon sx={{ color: errorMain }} />;
      case "pending":
        return <PendingIcon sx={{ color: warningMain }} />;
      default:
        return <OrderIcon sx={{ color: infoMain }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "success";
      case "rejected":
        return "error";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusColorValue = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return successMain;
      case "rejected":
        return errorMain;
      case "pending":
        return warningMain;
      default:
        return primaryMain;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return t("justNow") || "Just now";
    if (diffInHours < 24) return t("hoursAgo", { count: diffInHours }) || `${diffInHours} hours ago`;
    if (diffInHours < 48) return t("yesterday") || "Yesterday";
    return date.toLocaleDateString();
  };

  const handleClick = () => {
    if (order?.orderId) {
      navigate(`/orders/${order.orderId}`);
    }
  };

  return (
    <>
      <ListItem
        sx={{
          py: 2,
          cursor: "pointer",
          borderRadius: 1,
          transition: "all 0.2s",
          "&:hover": {
            bgcolor: alpha(theme?.palette?.action?.hover || '#000000', 0.5),
            transform: "translateX(4px)",
          },
        }}
        onClick={handleClick}
      >
        <ListItemAvatar>
          <Avatar
            sx={{
              bgcolor: alpha(getStatusColorValue(order?.status), 0.1),
              color: getStatusColorValue(order?.status),
            }}
          >
            {getStatusIcon(order?.status)}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ color: textPrimary }}>
                {t("order") || "Order"} #{order?.orderId || "N/A"}
              </Typography>
              <Chip
                label={order?.status || t("unknown") || "Unknown"}
                size="small"
                color={getStatusColor(order?.status)}
                variant="outlined"
              />
            </Box>
          }
          secondary={
            <Box>
              <Typography variant="body2" sx={{ color: textSecondary }} gutterBottom>
                {order?.adminComment || t("noComment") || "No comment"}
              </Typography>
              <Typography variant="caption" sx={{ color: textSecondary }}>
                {formatDate(order?.createdAt)}
              </Typography>
            </Box>
          }
        />
        <IconButton size="small" sx={{ opacity: 0.6 }}>
          <MoreIcon fontSize="small" />
        </IconButton>
      </ListItem>
      {index < total - 1 && <Divider variant="inset" component="li" />}
    </>
  );
});

ActivityItem.displayName = "ActivityItem";

const RecentActivity = memo(({ orders = [] }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  
  // Safe theme access
  const backgroundPaper = theme?.palette?.background?.paper || '#ffffff';
  const backgroundDefault = theme?.palette?.background?.default || '#fafafa';
  const textPrimary = theme?.palette?.text?.primary || '#000000';
  const textSecondary = theme?.palette?.text?.secondary || '#666666';
  const primaryMain = theme?.palette?.primary?.main || '#1976d2';

  const recentOrders = orders
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${alpha(backgroundPaper, 0.9)} 0%, ${alpha(backgroundDefault, 0.9)} 100%)`,
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <OrderIcon sx={{ color: primaryMain }} />
          <Typography variant="h6" fontWeight="bold" sx={{ color: textPrimary }}>
            {t("recentActivity") || "Recent Activity"}
          </Typography>
        </Box>
        <Chip
          label={`${recentOrders.length} ${t("items") || "items"}`}
          size="small"
          color="primary"
          variant="outlined"
        />
      </Box>

      {recentOrders.length > 0 ? (
        <List sx={{ p: 0 }}>
          {recentOrders.map((order, index) => (
            <ActivityItem
              key={order?.orderId || index}
              order={order}
              index={index}
              total={recentOrders.length}
            />
          ))}
        </List>
      ) : (
        <Box
          sx={{
            textAlign: "center",
            py: 4,
            color: textSecondary,
          }}
        >
          <OrderIcon sx={{ fontSize: 48, opacity: 0.3, mb: 2 }} />
          <Typography variant="body1" gutterBottom sx={{ color: textPrimary }}>
            {t("noRecentActivity") || "No recent activity"}
          </Typography>
          <Typography variant="body2" sx={{ color: textSecondary }}>
            {t("activityWillAppearHere") || "Recent activity will appear here"}
          </Typography>
        </Box>
      )}
    </Paper>
  );
});

RecentActivity.displayName = "RecentActivity";

export default RecentActivity;