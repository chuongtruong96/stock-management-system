// src/pages/User/Cart/CartItem.jsx
import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import QuantitySelector from "components/shop/QuantitySelector";
import { getProductImageUrl } from "utils/apiUtils";

export function CartItem({ item, onUpdate, onRemove }) {
  const product = item?.product;

  if (!product) return null;

  const unitLabel =
  typeof product.unit === "object" && product.unit !== null
    ? product.unit.name || product.unit.nameVn
    : product.unit;


  const imageSrc = product.image
    ? getProductImageUrl(product.image)
    : "/placeholder-prod.png";

  return (
    <ListItem>
      <ListItemAvatar>
        <Avatar src={imageSrc} alt={product.name} />
      </ListItemAvatar>
      <ListItemText
        primary={product.name}
        secondary={`Qty: ${item.qty} × ${unitLabel}`}
        sx={{ pr: 2 }}
      />
      <QuantitySelector value={item.qty} setValue={onUpdate} min={1} small />
      <IconButton onClick={onRemove} size="small" sx={{ ml: 1 }}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </ListItem>
  );
}
