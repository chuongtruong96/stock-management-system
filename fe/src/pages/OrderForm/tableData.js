/* pages/OrderForm/tableData.js */
import IconButton from "@mui/material/IconButton";
import Icon       from "@mui/material/Icon";
import TextField  from "@mui/material/TextField";
import Tooltip    from "@mui/material/Tooltip";

/* xây bảng động */
export const buildTable = (items, lang, onQty, onRemove) => ({
  columns: [
    { Header: "Code", accessor:"code", width:"14%" },
    { Header: lang==="vi"?"Tên":"Name", accessor:"name", width:"38%" },
    { Header: lang==="vi"?"ĐV":"Unit", accessor:"unit", width:"10%" },
    { Header: lang==="vi"?"HA":"Image",  accessor:"qcol", width:"16%" },
    { Header: " ",    accessor:"act",  align:"center", width:"10%" },
  ],

  rows: items.map(it=>({
    ...it,
    qcol: (
      <TextField
        type="number" size="small" sx={{width:85}}
        value={it.quantity}
        onChange={e=>onQty(it.id, +e.target.value||1)}
        inputProps={{min:1}}
      />
    ),
    act: (
      <Tooltip title={lang==="vi"?"Xóa":"Remove"}>
        <IconButton size="small" color="error" onClick={()=>onRemove(it.id)}>
          <Icon>delete</Icon>
        </IconButton>
      </Tooltip>
    ),
  })),
});
