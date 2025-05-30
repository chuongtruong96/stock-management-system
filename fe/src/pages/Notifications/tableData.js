import MDButton  from "components/MDButton";
import MDBadge   from "components/MDBadge";

/*------------------------------------------------------------------
  Xây bảng DataTable từ mảng notifications + callback markRead
 -----------------------------------------------------------------*/
export const buildTable = (items = [], onRead) => ({
  columns: [
    { Header:"#",        accessor:"idx",   width:"6%",  align:"center"},
    { Header:"Title",    accessor:"title", width:"28%"},
    { Header:"Message",  accessor:"msg",   width:"40%"},
    { Header:"Time",     accessor:"when",  width:"18%", align:"center"},
    { Header:"",         accessor:"act",   width:"8%",  align:"center"},
  ],

  rows: items.map((n, i)=>({
    ...n,
    idx : i+1,
    msg : n.message,
    when: new Date(n.createdAt).toLocaleString(),
    act : n.read ? (
      <MDBadge badgeContent="read" color="success" variant="gradient" size="sm" />
    ) : (
      <MDButton size="small" color="info" variant="gradient"
        onClick={()=>onRead(n.id)}>
        Mark
      </MDButton>
    ),
  })),
});
