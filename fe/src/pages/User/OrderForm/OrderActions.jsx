// src/pages/User/OrderForm/OrderActions.jsx
import MDButton from "../../../components/template/MDButton";

export default function OrderActions({
  rows, order, language, onSubmit, onExport, onUpload,
}) {
  return (
    <>
      <MDButton
        variant="gradient"
        color="info"
        size="large"
        disabled={!rows.length || order}
        onClick={onSubmit}
      >
        {language === "vi" ? "Tạo đơn" : "Create order"}
      </MDButton>

      {order?.status === "pending" && (
        <MDButton variant="outlined" color="info" onClick={onExport}>
          {language === "vi" ? "Xuất PDF" : "Export PDF"}
        </MDButton>
      )}

      {order?.status === "exported" && (
        <MDButton variant="outlined" color="info" onClick={onUpload}>
          {language === "vi" ? "Tải PDF đã ký" : "Upload signed PDF"}
        </MDButton>
      )}

      {order?.status === "submitted" && (
        <MDButton variant="gradient" color="success" disabled>
          {language === "vi" ? "Đang chờ admin" : "Waiting for admin…"}
        </MDButton>
      )}
    </>
  );
}
