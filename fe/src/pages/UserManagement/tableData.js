// buildDataTable config tuỳ ngôn ngữ
export const buildTable = (rows = [], lang = "en") => ({
    columns: [
      { Header: lang==="vi" ? "Username"  : "Username",  accessor:"username", width:"25%" },
      { Header: lang==="vi" ? "Vai trò"   : "Role",      accessor:"role",     width:"15%", align:"center" },
      { Header: lang==="vi" ? "Phòng ban" : "Department",accessor:"dept",    width:"30%" },
      { Header: lang==="vi" ? "Thao tác"  : "Actions",   accessor:"action",   align:"center" },
    ],
    rows,
  });
  