import { CardActionArea, CardContent, CardMedia, Typography } from "@mui/material";
import CardBase from "../common/CardBase";
import { Box } from "@mui/system";
import { useNavigate } from "react-router-dom";
import { getCategoryIconUrl } from "utils/apiUtils";
import TranslatableText from "../translation/TranslatableText";
import "../../css/components/CategoryCard.css"; // Import the CSS file

export default function CategoryCard({ data, disabled = false }) {
  const navigate = useNavigate();
  
  // Get the display name (prefer Vietnamese, fallback to English)
  const displayName = data?.nameVn || data?.nameEn || data?.code || 'Unknown';

  return (
    <CardBase className="category-card" sx={{ height: 220}}>
      <CardActionArea
        sx={{ flexGrow: 1 }}
        disabled={disabled}
        onClick={() =>
          navigate(`/products?page=0&categoryId=${data.categoryId}`)
        }
      >
        <Box 
          sx={{ 
            position: 'relative',
            height: 140,
            overflow: 'hidden',
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
              background: 'radial-gradient(circle at center, rgba(102, 126, 234, 0.03) 0%, transparent 70%)',
              transition: 'opacity 0.3s ease',
              opacity: 0,
            },
            '&:hover::before': {
              opacity: 1,
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)',
              transform: 'translateX(-100%)',
              transition: 'transform 0.6s ease',
            },
            '&:hover::after': {
              transform: 'translateX(100%)',
            },
          }}
        >
          <CardMedia
            component="img"
            image={
              data.icon && data.icon !== 'null' && data.icon !== 'undefined'
                ? getCategoryIconUrl(data.icon)
                : "/placeholder-category.png"
            }
            alt={data.nameEn || data.nameVn || data.code}
            sx={{ 
              maxWidth: '80%',
              maxHeight: '80%',
              objectFit: "contain",
              objectPosition: "center",
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.08))',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                filter: 'drop-shadow(0 4px 16px rgba(102, 126, 234, 0.15))',
                transform: 'scale(1.05) translateY(-2px)',
              },
            }}
            loading="lazy"
          />
          
          {/* Decorative elements */}
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              opacity: 0.6,
              transition: 'all 0.3s ease',
              transform: 'scale(0)',
            }}
            className="category-dot"
          />
          
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              width: 4,
              height: 4,
              borderRadius: '50%',
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              opacity: 0.4,
              transition: 'all 0.3s ease',
              transform: 'scale(0)',
            }}
            className="category-dot-small"
          />
        </Box>
        <CardContent sx={{ bgcolor: "grey.100", textAlign: "center", py: 0.5, px: 1 }}>
          <TranslatableText
            component="subtitle2"
            sx={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
              overflow: "hidden",
              lineHeight: 1.2,
              mb: 0.5,
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            {displayName}
          </TranslatableText>
          {data.productCount !== undefined && (
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ 
                fontSize: "0.75rem",
                lineHeight: 1,
                display: "block",
              }}
            >
              {data.productCount} items
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
    </CardBase>
  );
}