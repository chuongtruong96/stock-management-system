import MDButton from "components/template/MDButton";
import MDBadge from "components/template/MDBadge";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export const buildTable = (items = [], onRead, t) => ({
  columns: [
    { Header: "#", accessor: "idx", width: "6%", align: "center" },
    { Header: t("title") || "Title", accessor: "title", width: "30%" },
    { Header: t("message") || "Message", accessor: "msg", width: "40%" },
    { Header: t("time") || "Time", accessor: "when", width: "18%", align: "center" },
    { Header: "", accessor: "act", width: "6%", align: "center" },
  ],
  rows: items.map((n, i) => ({
    ...n,
    idx: i + 1,
    msg: n.message,
    when: dayjs(n.createdAt).fromNow(), // ✨ "3 minutes ago"
    act: n.read ? (
      <MDBadge
        badgeContent={t("read")}
        color="success"
        variant="gradient"
        size="sm"
      />
    ) : (
      <MDButton
        size="small"
        color="info"
        variant="gradient"
        onClick={() => onRead(n.id)}
      >
        {t("mark") || "Mark"}
      </MDButton>
    ),
  })),
});
