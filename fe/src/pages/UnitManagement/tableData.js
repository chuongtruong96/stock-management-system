export const buildTable = (rows = [], lang = "en") => ({
    columns: [
      { Header: lang==="vi" ? "Tên (EN)" : "Name (EN)", accessor:"nameEn", width:"45%" },
      { Header: lang==="vi" ? "Tên (VI)" : "Name (VI)", accessor:"nameVn", width:"45%" },
      { Header: lang==="vi" ? "Thao tác" : "Actions",   accessor:"action",  align:"center" },
    ],
    rows,
  });
  