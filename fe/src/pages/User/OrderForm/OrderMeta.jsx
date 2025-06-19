// src/pages/User/OrderForm/OrderMeta.jsx
import MDTypography from "../../../components/template/MDTypography";

export default function OrderMeta({ user, dept, date, language, canOrder }) {
  return (
    <>
      <MDTypography variant="h4" mb={1}>
        {language === "vi" ? "Đơn đặt hàng" : "Order form"}
      </MDTypography>
      <MDTypography>
        {language === "vi" ? "Phòng ban" : "Department"}: {dept}
      </MDTypography>
      <MDTypography>
        {language === "vi" ? "Người dùng" : "User"}: {user?.username || "…"}
      </MDTypography>
      <MDTypography>
        {language === "vi" ? "Ngày" : "Date"}: {date}
      </MDTypography>
      {!canOrder && (
        <MDTypography color="error" fontWeight="bold" mt={1}>
          {language === "vi"
            ? "(Cửa sổ đặt hàng đang đóng)"
            : "(Ordering window closed)"}
        </MDTypography>
      )}
    </>
  );
}
