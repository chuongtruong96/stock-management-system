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
import BilingualText from "../translation/BilingualText";

/** Compact product card for homepage/category display - view only */
function ProductCardCompact({ data }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const { t } = useTranslation('products');

  if (!data) return null;

  const { 
    id, 
    name, 
    nameEn, 
    nameVn, 
    image, 
    unit, 
    description, 
    descriptionEn, 
    descriptionVn 
  } = data;

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
        height: 300, 
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        border: "1px solid #e3f2fd",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        cursor: 'pointer',
        background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
        "&:hover": {
          transform: "translateY(-6px) scale(1.02)",
          boxShadow: "0 16px 40px rgba(102, 126, 234, 0.15)",
          borderColor: 'rgba(102, 126, 234, 0.4)',
        },
        "&::before": {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%)',
          opacity: 0,
          transition: 'opacity 0.3s ease',
          zIndex: 1,
        },
        "&:hover::before": {
          opacity: 1,
        },
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate(`/products/${id}`)}
    >
      <Box sx={{ 
        position: "relative", 
        overflow: 'hidden', 
        zIndex: 2,
        height: 160,
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at center, rgba(102, 126, 234, 0.04) 0%, transparent 70%)',
          transition: 'opacity 0.3s ease',
          opacity: isHovered ? 1 : 0,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)',
          transform: isHovered ? 'translateX(100%)' : 'translateX(-100%)',
          transition: 'transform 0.6s ease',
        },
      }}>
        <CardMedia
          component="img"
          image={imageSrc}
          alt={name || "Unnamed Product"}
          sx={{
            maxWidth: '85%',
            maxHeight: '85%',
            objectFit: "contain",
            objectPosition: "center",
            filter: isHovered 
              ? 'drop-shadow(0 6px 20px rgba(102, 126, 234, 0.2))' 
              : 'drop-shadow(0 2px 8px rgba(0,0,0,0.08))',
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: isHovered ? "scale(1.08) translateY(-2px)" : "scale(1)",
          }}
          loading="lazy"
        />
        
        {/* Decorative corner elements */}
        <Box
          sx={{
            position: 'absolute',
            top: 6,
            right: 6,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            opacity: isHovered ? 0.7 : 0,
            transition: 'all 0.3s ease',
            transform: isHovered ? 'scale(1)' : 'scale(0)',
          }}
        />
        
        <Box
          sx={{
            position: 'absolute',
            bottom: 6,
            left: 6,
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            opacity: isHovered ? 0.5 : 0,
            transition: 'all 0.3s ease',
            transform: isHovered ? 'scale(1)' : 'scale(0)',
          }}
        />
        
        {/* Enhanced Overlay on hover */}
        <Fade in={isHovered}>
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(135deg, rgba(102, 126, 234, 0.85) 0%, rgba(118, 75, 162, 0.85) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: isHovered ? 1 : 0,
              transition: "all 0.4s ease-in-out",
              backdropFilter: "blur(2px)",
            }}
          >
            <Tooltip title="View Product Details" arrow>
              <IconButton
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.95)",
                  color: "#667eea",
                  width: 48,
                  height: 48,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                  "&:hover": {
                    bgcolor: "white",
                    transform: "scale(1.15) rotate(5deg)",
                    boxShadow: "0 12px 32px rgba(0,0,0,0.3)",
                  },
                  transition: "all 0.3s ease-in-out",
                }}
              >
                <VisibilityIcon fontSize="medium" />
              </IconButton>
            </Tooltip>
          </Box>
        </Fade>
        
        {/* Subtle gradient overlay at bottom */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 20,
            background: "linear-gradient(transparent, rgba(0,0,0,0.05))",
            pointerEvents: "none",
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2, height: 140, position: 'relative', zIndex: 2 }}>
        <BilingualText
          en={nameEn || name}
          vi={nameVn}
          fallback="Unnamed Product"
          component="subtitle1"
          sx={{
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 2,
            overflow: "hidden",
            color: "#1a1a1a",
            mb: 1.5,
            minHeight: 44,
            lineHeight: 1.3,
            fontSize: '1rem',
            fontWeight: 700,
            transition: "color 0.3s ease",
            "&:hover": {
              color: "#667eea",
            },
          }}
          enableTranslation={true}
        />

        {(descriptionEn || descriptionVn || description) && (
          <BilingualText
            en={descriptionEn || description}
            vi={descriptionVn}
            fallback=""
            component="body2"
            sx={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
              overflow: "hidden",
              mb: 2,
              minHeight: 32,
              fontSize: '0.85rem',
              lineHeight: 1.3,
              color: "#6b7280",
            }}
            enableTranslation={true}
          />
        )}

        {unitLabel && (
          <Box sx={{ position: 'absolute', bottom: 12, left: 16, right: 16 }}>
            <Chip
              label={`${t('product.unit')}: ${unitLabel}`}
              size="small"
              sx={{
                fontSize: "0.7rem",
                height: 24,
                borderRadius: 2,
                background: "linear-gradient(45deg, rgba(102, 126, 234, 0.1) 30%, rgba(118, 75, 162, 0.1) 90%)",
                border: "1px solid rgba(102, 126, 234, 0.2)",
                color: "#667eea",
                fontWeight: 600,
                '& .MuiChip-label': {
                  px: 1.5,
                },
                transition: "all 0.3s ease",
                "&:hover": {
                  background: "linear-gradient(45deg, rgba(102, 126, 234, 0.15) 30%, rgba(118, 75, 162, 0.15) 90%)",
                  transform: "translateY(-1px)",
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