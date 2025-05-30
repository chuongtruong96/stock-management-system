export function CartItem({ item, onUpdate, onRemove }) {
  return (
    <ListItem>
      <ListItemAvatar>
        <Avatar src={item.product.imageUrl || "/placeholder-prod.png"} />
      </ListItemAvatar>
      <ListItemText
        primary={item.product.name}
        secondary={`Qty: ${item.qty}`}
        sx={{ pr: 2 }}
      />
      <QuantitySelector value={item.qty} setValue={onUpdate} min={1} small />
      <IconButton onClick={onRemove} size="small" sx={{ ml: 1 }}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </ListItem>
  );
}