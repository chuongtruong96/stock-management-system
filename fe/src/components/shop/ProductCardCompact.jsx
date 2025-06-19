import { memo, useState } from "react";
import { 
  CardContent, 
  CardMedia, 
  Typography, 
  Box,
  Fade,
  IconButton,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import CardBase from "../common/CardBase";
import { useTranslation } from "react-i18next";

/** Compact product card for homepage/category display - view only */
function ProductCardCompact({ data }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const { t } = useTranslation();

  if (!data) return null;

  const { id, name, image, unit, description } = data;

  /* Always coerce unit to a string in case backend changes */
  const unitLabel = (() => {
    if (!unit) return "";
    if (typeof unit === "string") return unit;
    if (typeof unit === "object") return unit.name ?? "";
    return String(unit);
  })();

  const imageSrc = image
    ? `/uploads/product-img/${image}`
    : "/placeholder-prod.png";

  return (
    <CardBase 
      sx={{ 
        height: 280, 
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden',
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        border: "1px solid #e0e0e0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        cursor: 'pointer',
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          borderColor: 'primary.main',
        },
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/products/${id}`)}
    >
      <Box sx={{ position: "relative", overflow: 'hidden' }}>
        <CardMedia
          component="img"
          height={140}
          image={imageSrc}
          alt={name || "Unnamed Product"}
          sx={{
            objectFit: "cover",
            transition: "all 0.3s ease-in-out",
            transform: isHovered ? "scale(1.03)" : "scale(1)",
          }}
          loading="lazy"
        />
        
        {/* Overlay on hover */}
        <Fade in={isHovered}>
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(135deg, rgba(33, 150, 243, 0.7) 0%, rgba(33, 203, 243, 0.7) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: isHovered ? 1 : 0,
              transition: "opacity 0.3s ease-in-out",
            }}
          >
            <Tooltip title="View Details">
              <IconButton
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.9)",
                  color: "primary.main",
                  "&:hover": {
                    bgcolor: "white",
                    transform: "scale(1.1)",
                  },
                }}
              >
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Fade>
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 1.5, height: 140 }}>
        <Typography
          variant="subtitle1"
          fontWeight={600}
          sx={{
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 2,
            overflow: "hidden",
            color: "text.primary",
            mb: 1,
            minHeight: 48,
            lineHeight: 1.2,
            fontSize: '0.95rem',
          }}
        >
          {name || "Unnamed Product"}
        </Typography>

        {description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
              overflow: "hidden",
              mb: 1,
              minHeight: 32,
              fontSize: '0.8rem',
              lineHeight: 1.2,
            }}
          >
            {description}
          </Typography>
        )}

        {unitLabel && (
          <Box sx={{ position: 'absolute', bottom: 8, left: 12, right: 12 }}>
            <Chip
              label={`${t('product.unit')}: ${unitLabel}`}
              size="small"
              variant="outlined"
              sx={{
                fontSize: "0.7rem",
                height: 20,
                borderRadius: 1,
                '& .MuiChip-label': {
                  px: 1,
                },
              }}
            />
          </Box>
        )}
      </CardContent>
    </CardBase>
  );
}

export default memo(ProductCardCompact);