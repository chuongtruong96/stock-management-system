/* xây 2 bảng: danh sách đơn & chi‑tiết items  */
import MDButton from "components/MDButton";

/* -------- danh sách đơn ------------ */
export const buildOrdersTable = (orders, lang, onDetail) => ({
  columns: [
    { Header: "ID",    accessor:"orderId", width:"6%" },
    { Header: lang==="vi"?"Ngày tạo":"Created",
      accessor:"date", width:"18%", align:"center" },
    { Header: "Status", accessor:"status", width:"12%", align:"center" },
    { Header: lang==="vi"?"Ghi chú":"Comment",
      accessor:"adminComment", width:"46%" },
    { Header: " ", accessor:"act", align:"center", width:"10%" },
  ],
  rows: orders.map(o=>({
    ...o,
    date: new Date(o.createdAt).toLocaleString(),
    adminComment: o.adminComment||"–",
    act: (
      <MDButton size="small" variant="gradient" color="info"
        onClick={()=>onDetail(o.orderId)}>
        {lang==="vi"?"Chi tiết":"Details"}
      </MDButton>
    ),
  })),
});


/* -------- chi‑tiết dòng SP ---------- */
export const buildItemsTable = (items, lang) => ({
  columns:[
    { Header:"ID", accessor:"orderItemId", width:"6%" },
    { Header:"SP", accessor:"productId",   width:"8%" },
    { Header:lang==="vi"?"Tên sản phẩm":"Product",
      accessor:"productName", width:"46%" },
    { Header:lang==="vi"?"SL":"Qty", accessor:"quantity", width:"10%", align:"center"},
    { Header:lang==="vi"?"Đơn vị":"Unit", accessor:"unitNameVn", width:"12%"}
  ],
  rows : items,
});
