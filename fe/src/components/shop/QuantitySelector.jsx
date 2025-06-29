// src/components/shop/QuantitySelector.jsx
import { IconButton, Box, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

export default function QuantitySelector({
  value,
  setValue,
  min = 1,
  max = 999,
  size = "medium",
}) {
  const inc = () => value < max && setValue(value + 1);
  const dec = () => value > min && setValue(value - 1);

  // Size configurations
  const sizeConfig = {
    small: {
      width: 24,
      height: 32,
      fontSize: "0.875rem",
      iconSize: "small",
      borderRadius: 1,
    },
    medium: {
      width: 32,
      height: 40,
      fontSize: "1rem",
      iconSize: "medium",
      borderRadius: 1.5,
    },
    large: {
      width: 48,
      height: 48,
      fontSize: "1.125rem",
      iconSize: "medium",
      borderRadius: 2,
    },
  };

  const config = sizeConfig[size] || sizeConfig.medium;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        border: "2px solid",
        borderColor: "grey.300",
        borderRadius: config.borderRadius,
        bgcolor: "background.paper",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        '&:hover': {
          borderColor: "primary.main",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        },
        transition: "all 0.3s ease-in-out",
      }}
    >
      <IconButton 
        size={config.iconSize} 
        onClick={dec}
        disabled={value <= min}
        sx={{
          borderRadius: `${config.borderRadius * 4}px 0 0 ${config.borderRadius * 4}px`,
          '&:hover': {
            bgcolor: 'error.50',
            color: 'error.main',
          },
          '&:disabled': {
            color: 'grey.400',
          },
          transition: 'all 0.2s ease-in-out',
        }}
      >
        <RemoveIcon fontSize="inherit" />
      </IconButton>
      
      <Typography
        variant="subtitle1"
        sx={{ 
          width: config.width,
          height: config.height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: config.fontSize,
          fontWeight: 600,
          color: 'text.primary',
          bgcolor: 'grey.50',
          borderLeft: '1px solid',
          borderRight: '1px solid',
          borderColor: 'grey.200',
          userSelect: 'none',
        }}
      >
        {value}
      </Typography>
      
      <IconButton 
        size={config.iconSize} 
        onClick={inc}
        disabled={value >= max}
        sx={{
          borderRadius: `0 ${config.borderRadius * 4}px ${config.borderRadius * 4}px 0`,
          '&:hover': {
            bgcolor: 'success.50',
            color: 'success.main',
          },
          '&:disabled': {
            color: 'grey.400',
          },
          transition: 'all 0.2s ease-in-out',
        }}
      >
        <AddIcon fontSize="inherit" />
      </IconButton>
    </Box>
  );
}
