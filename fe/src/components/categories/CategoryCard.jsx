import { CardActionArea, CardContent, CardMedia, Typography } from "@mui/material";
import CardBase from "../common/CardBase";
import { useNavigate } from "react-router-dom";
import "../../css/components/CategoryCard.css"; // Import the CSS file

export default function CategoryCard({ data, disabled = false }) {
  const navigate = useNavigate();
  return (
    <CardBase className="category-card" sx={{ height: 220, opacity: disabled ? 0.4 : 1 }}>
      <CardActionArea
        sx={{ flexGrow: 1 }}
        disabled={disabled}
        onClick={() =>
          navigate(`/products?page=0&categoryId=${data.categoryId}`)
        }
      >
        <CardMedia
          component="img"
          image={
            data.image
              ? `/uploads/category-img/${data.image}`
              : "/placeholder-category.png"
          }
          alt={data.nameEn || data.nameVn || data.code}
          sx={{ height: 140, objectFit: "cover" }}
          loading="lazy"
        />
        <CardContent sx={{ bgcolor: "grey.100", textAlign: "center", py: 0.5, px: 1 }}>
          <Typography
            variant="subtitle2"
            fontWeight={600}
            sx={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
              overflow: "hidden",
              lineHeight: 1.2,
              mb: 0.5,
              fontSize: "0.875rem",
            }}
          >
            {data.nameEn || data.nameVn || data.code}
          </Typography>
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