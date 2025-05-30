import { Card } from "@mui/material";

export default function CardBase({ children, sx = {}, ...rest }) {
  return (
    <Card
      elevation={0}
      {...rest}
      sx={{
        width: "100%",
        border: 1,
        borderColor: "grey.300",
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "box-shadow .2s, transform .2s",
        "&:hover": { boxShadow: 4, transform: "translateY(-2px)" },
        ...sx,
      }}
    >
      {children}
    </Card>
  );
}