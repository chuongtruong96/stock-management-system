import { Typography, Stack } from "@mui/material";

/**
 * Tiêu-đề section dùng lại ở mọi nơi
 *  • `subtitle` hiển thị nhỏ bên trên (overline)
 *  • gạch chỉ màu primary ở dưới
 */
export default function SectionTitle({ children, subtitle, align = "center" }) {
  return (
    <Stack
      spacing={1}
      alignItems={align === "center" ? "center" : "flex-start"}
      mb={4}
    >
      {subtitle && (
        <Typography
          variant="overline"
          color="text.secondary"
          letterSpacing={2}
        >
          {subtitle}
        </Typography>
      )}

      <Typography
        variant="h4"
        fontWeight={700}
        sx={{ textTransform: "uppercase", letterSpacing: 2 }}
        textAlign={align}
      >
        {children}
      </Typography>

      {/* gạch trang trí */}
      <Stack
        sx={{
          width: 40,
          height: 4,
          bgcolor: "primary.main",
          borderRadius: 2,
        }}
      />
    </Stack>
  );
}
