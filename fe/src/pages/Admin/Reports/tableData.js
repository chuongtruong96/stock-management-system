/*  Xây cấu trúc bảng cho DataTable  */
export const buildTable = (rows = [], lang = "en") => ({
    columns: [
      { Header: lang==="vi" ? "Phòng ban" : "Department",    accessor:"department",     width:"20%"},
      { Header: lang==="vi" ? "Mã SP"     : "Product Code",  accessor:"productCode",    width:"12%", align:"center"},
      { Header: lang==="vi" ? "Tên SP"    : "Product Name",  accessor:"productNameVn",  width:"34%"},
      { Header: lang==="vi" ? "Số lượng"  : "Quantity",      accessor:"quantity",       width:"12%", align:"center"},
      { Header: lang==="vi" ? "Đơn vị"    : "Unit",          accessor:"unit",           width:"12%", align:"center"},
    ],
    rows,
  });
  