import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  useTheme,
  alpha,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  Launch as LaunchIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";

const EnhancedMetricCard = ({
  title,
  count,
  icon,
  color = "primary",
  percentage,
  trend = "flat",
  route,
  loading = false,
  description,
  subtitle,
  ...rest
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const colorMap = {
    primary: theme.palette.primary,
    secondary: theme.palette.secondary,
    success: theme.palette.success,
    warning: theme.palette.warning,
    error: theme.palette.error,
    info: theme.palette.info,
  };

  const selectedColor = colorMap[color] || colorMap.primary;

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUpIcon sx={{ fontSize: "1rem", color: theme.palette.success.main }} />;
      case "down":
        return <TrendingDownIcon sx={{ fontSize: "1rem", color: theme.palette.error.main }} />;
      default:
        return <TrendingFlatIcon sx={{ fontSize: "1rem", color: theme.palette.text.secondary }} />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return theme.palette.success.main;
      case "down":
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const handleCardClick = () => {
    if (route) {
      navigate(route);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card
        sx={{
          position: "relative",
          overflow: "visible",
          cursor: route ? "pointer" : "default",
          borderRadius: 3,
          border: `1px solid ${alpha(selectedColor.main, 0.1)}`,
          background: `linear-gradient(135deg, 
            ${alpha(selectedColor.main, 0.05)} 0%, 
            ${alpha(selectedColor.main, 0.02)} 50%, 
            ${alpha(theme.palette.background.paper, 0.95)} 100%
          )`,
          backdropFilter: "blur(20px)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            boxShadow: `0 12px 40px ${alpha(selectedColor.main, 0.15)}`,
            borderColor: alpha(selectedColor.main, 0.3),
            background: `linear-gradient(135deg, 
              ${alpha(selectedColor.main, 0.08)} 0%, 
              ${alpha(selectedColor.main, 0.04)} 50%, 
              ${alpha(theme.palette.background.paper, 0.98)} 100%
            )`,
          },
          // Glassmorphism effect
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, 
              ${alpha(theme.palette.common.white, 0.1)} 0%, 
              ${alpha(theme.palette.common.white, 0.05)} 100%
            )`,
            borderRadius: "inherit",
            pointerEvents: "none",
          },
        }}
        onClick={handleCardClick}
        {...rest}
      >
        {/* Animated background gradient */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, 
              ${selectedColor.main} 0%, 
              ${selectedColor.light} 50%, 
              ${selectedColor.main} 100%
            )`,
            borderRadius: "12px 12px 0 0",
            transform: isHovered ? "scaleX(1)" : "scaleX(0.7)",
            transformOrigin: "center",
            transition: "transform 0.3s ease",
          }}
        />

        <CardContent sx={{ p: 3, position: "relative", zIndex: 1 }}>
          {/* Header Section */}
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
            {/* Icon */}
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `linear-gradient(135deg, ${selectedColor.main} 0%, ${selectedColor.dark} 100%)`,
                boxShadow: `0 8px 24px ${alpha(selectedColor.main, 0.3)}`,
                color: "white",
                transform: isHovered ? "scale(1.1) rotate(5deg)" : "scale(1)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              {typeof icon === "string" ? (
                <Box component="i" className="material-icons" sx={{ fontSize: "1.5rem" }}>
                  {icon}
                </Box>
              ) : (
                icon
              )}
            </Box>

            {/* Action Button */}
            {route && (
              <Tooltip title={`Go to ${title}`}>
                <IconButton
                  size="small"
                  sx={{
                    bgcolor: alpha(selectedColor.main, 0.1),
                    color: selectedColor.main,
                    opacity: isHovered ? 1 : 0.7,
                    transform: isHovered ? "scale(1.1)" : "scale(1)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      bgcolor: alpha(selectedColor.main, 0.2),
                      transform: "scale(1.2)",
                    },
                  }}
                >
                  <LaunchIcon sx={{ fontSize: "1rem" }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {/* Content Section */}
          <Box sx={{ mb: 2 }}>
            {/* Title */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                mb: 0.5,
                fontSize: "0.95rem",
                lineHeight: 1.3,
              }}
            >
              {title}
            </Typography>

            {/* Subtitle */}
            {subtitle && (
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: "0.75rem",
                  display: "block",
                  mb: 1,
                }}
              >
                {subtitle}
              </Typography>
            )}

            {/* Main Count */}
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 1 }}>
              {loading ? (
                <CircularProgress size={24} thickness={4} sx={{ color: selectedColor.main }} />
              ) : (
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    color: selectedColor.main,
                    fontSize: "2.2rem",
                    lineHeight: 1,
                    background: `linear-gradient(135deg, ${selectedColor.main} 0%, ${selectedColor.dark} 100%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {typeof count === "number" ? count.toLocaleString() : count}
                </Typography>
              )}

              {/* Trend Indicator */}
              {trend !== "flat" && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  {getTrendIcon()}
                </Box>
              )}
            </Box>
          </Box>

          {/* Footer Section */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {/* Percentage/Additional Info */}
            {percentage && (
              <Chip
                label={`${percentage.amount} ${percentage.label || ""}`}
                size="small"
                sx={{
                  height: 24,
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  bgcolor: alpha(getTrendColor(), 0.1),
                  color: getTrendColor(),
                  border: `1px solid ${alpha(getTrendColor(), 0.2)}`,
                  "& .MuiChip-label": {
                    px: 1,
                  },
                }}
              />
            )}

            {/* Description */}
            {description && (
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.text.secondary,
                  fontSize: "0.7rem",
                  fontStyle: "italic",
                  textAlign: "right",
                  flex: 1,
                  ml: 1,
                }}
              >
                {description}
              </Typography>
            )}
          </Box>

          {/* Progress Bar (if percentage exists) */}
          {percentage && percentage.amount && (
            <Box sx={{ mt: 2 }}>
              <Box
                sx={{
                  width: "100%",
                  height: 4,
                  borderRadius: 2,
                  bgcolor: alpha(selectedColor.main, 0.1),
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    width: `${Math.min(parseInt(percentage.amount) || 0, 100)}%`,
                    height: "100%",
                    background: `linear-gradient(90deg, ${selectedColor.main} 0%, ${selectedColor.light} 100%)`,
                    borderRadius: 2,
                    transition: "width 1s ease-in-out",
                  }}
                />
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EnhancedMetricCard;