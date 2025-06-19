import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Chip, Tooltip } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import { useOrderWindow } from "../../context/OrderWindowContext";

function getClosingTimestamp() {
  const now = dayjs();
  return dayjs(new Date(now.year(), now.month(), 7, 23, 59, 59));
}

export default function OrderWindowIndicator() {
  const { canOrder } = useOrderWindow();
  const [secondsLeft, setSecondsLeft] = useState(
    getClosingTimestamp().diff(dayjs(), "second")
  );

  useEffect(() => {
    if (!canOrder) return;
    const id = setInterval(() => {
      setSecondsLeft(getClosingTimestamp().diff(dayjs(), "second"));
    }, 1000);
    return () => clearInterval(id);
  }, [canOrder]);

  const sec = Math.max(secondsLeft, 0);
  const fmt =
    String(Math.floor(sec / 3600)).padStart(2, "0") +
    ":" +
    String(Math.floor((sec % 3600) / 60)).padStart(2, "0") +
    ":" +
    String(sec % 60).padStart(2, "0");

  return canOrder ? (
    <Tooltip title="Ordering window is open">
      <Chip
        sx={{ mr: 2 }}
        color="success"
        icon={<AccessTimeIcon />}
        label={`Time left: ${fmt}`}
        size="small"
      />
    </Tooltip>
  ) : (
    <Tooltip title="Ordering window closed">
      <Chip
        sx={{ mr: 2 }}
        color="error"
        icon={<DoNotDisturbIcon />}
        label="Order window closed"
        size="small"
      />
    </Tooltip>
  );
}
