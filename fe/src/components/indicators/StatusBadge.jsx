// ─ File: src/components/StatusBadge.jsx
import { Chip } from "@mui/material";
const colorMap = {
  pending: "warning",
  exported: "info",
  submitted: "secondary",
  approved: "success",
  rejected: "error",
};
export default function StatusBadge({ status }) {
  return <Chip color={colorMap[status] || "default"} label={status} size="small" />;
}