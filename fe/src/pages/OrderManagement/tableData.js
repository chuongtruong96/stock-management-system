// src/pages/OrderManagement/tableData.js
import MDBadge from "components/MDBadge";
import MDTypography from "components/MDTypography";

export const columns = (lang) => [
  { Header: "ID",           accessor: "orderId",     width: "5%"  },
  { Header: lang==='vi'?"Ngày tạo":"Created",        accessor: "createdAt"  },
  { Header: lang==='vi'?"Cập nhật":"Updated",        accessor: "updatedAt"  },
  { Header: lang==='vi'?"Trạng thái":"Status",       accessor: "status",    align:"center" },
  { Header: lang==='vi'?"Ghi chú":"Comment",         accessor: "adminComment" },
  { Header: lang==='vi'?"Thao tác":"Action",         accessor: "action",    align:"center", width:"10%"},
];

export const rows = (orders, openDialog, handleDelete) =>
  orders.map(o => ({
    orderId : o.orderId,
    createdAt  : o.createdAt?.toLocaleString() ?? "—",
    updatedAt  : o.updatedAt?.toLocaleString() ?? "—",
    status     : (
      <MDBadge
        badgeContent={o.status}
        color={
          o.status === "approved" ? "success" :
          o.status === "rejected" ? "error" :
          o.status === "submitted" ? "info" :
          "warning"
        }
        variant="gradient"
        size="sm"
      />
    ),
    adminComment : o.adminComment || "—",
    action : (
      <>
        <MDTypography
          component="a"
          href="#view"
          variant="caption"
          fontWeight="medium"
          onClick={()=>openDialog(o,"view")}
        >
          Details
        </MDTypography>
        {o.status === "pending" && (
          <MDTypography
            component="a"
            href="#submit"
            variant="caption"
            fontWeight="medium"
            sx={{ ml: 1 }}
            onClick={()=>openDialog(o,"submit")}
          >
            Submit PDF
          </MDTypography>
        )}
      </>
    )
  }));
