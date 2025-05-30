/* pages/ProductManagement/tableData.js */
import IconButton from "@mui/material/IconButton";
import Tooltip    from "@mui/material/Tooltip";
import Icon       from "@mui/material/Icon";
import Avatar    from "@mui/material/Avatar";
export const buildTable = (rows, lang, onEdit, onDelete) => ({
  columns: [
    { Header:' ',accessor:'img',width:'8%',Cell:({row})=>(<Avatar src={`/assets/prod/${row.original.image}`} />) },
    { Header: "Code", accessor: "code", width: "12%" },
    { Header: lang==="vi" ? "Tên" : "Name", accessor: "name", width: "26%" },
    { Header: lang==="vi" ? "Đơn vị" : "Unit", accessor: "unit", width: "14%" },
    { Header: " ", accessor: "action", align:"center", width:"18%" },
  ],

  rows: rows.map(p => ({
    image: p.image ? `/assets/prod/${p.image}` : '/placeholder.png',
    code: p.code,
    name: p.name,
    unit: p.unit,
    ...p,
    action: (
      <>
        <Tooltip title={lang==="vi"?"Sửa":"Edit"}>
          <IconButton size="small" color="info" onClick={()=>onEdit(p)}>
            <Icon>edit</Icon>
          </IconButton>
        </Tooltip>
        <Tooltip title={lang==="vi"?"Xóa":"Delete"}>
          <IconButton size="small" color="error" onClick={()=>onDelete(p.id)}>
            <Icon>delete</Icon>
          </IconButton>
        </Tooltip>
      </>
    ),
  })),
});
