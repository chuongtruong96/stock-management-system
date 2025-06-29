import { useEffect, useState } from "react";
import { Chip, Tooltip } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import { useOrderWindow } from "../../context/OrderWindowContext";

export default function OrderWindowIndicator() {
  const { canOrder, reason, isNaturalPeriod, isAdminOverride, secondsRemaining, message } = useOrderWindow();
  const [currentSecondsLeft, setCurrentSecondsLeft] = useState(secondsRemaining);

  useEffect(() => {
    // Only start countdown if we're in natural period and have time remaining
    if (!canOrder || !isNaturalPeriod || secondsRemaining <= 0) {
      setCurrentSecondsLeft(0);
      return;
    }

    // Initialize with the seconds from backend
    setCurrentSecondsLeft(secondsRemaining);

    // Start countdown timer
    const id = setInterval(() => {
      setCurrentSecondsLeft(prev => {
        const newValue = Math.max(prev - 1, 0);
        if (newValue <= 0) {
          clearInterval(id);
        }
        return newValue;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [canOrder, isNaturalPeriod, secondsRemaining]);

  // Format time display
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Determine display based on reason
  if (!canOrder) {
    return (
      <Tooltip title={message || "Ordering window is closed"}>
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

  if (isAdminOverride) {
    return (
      <Tooltip title="Admin has opened the order window for urgent orders">
        <Chip
          sx={{ mr: 2 }}
          color="warning"
          icon={<AdminPanelSettingsIcon />}
          label="Admin Override Active"
          size="small"
        />
      </Tooltip>
    );
  }

  if (isNaturalPeriod) {
    return (
      <Tooltip title="Natural ordering period - First week of the month">
        <Chip
          sx={{ mr: 2 }}
          color="success"
          icon={<AccessTimeIcon />}
          label={`Time left: ${formatTime(currentSecondsLeft)}`}
          size="small"
        />
      </Tooltip>
    );
  }

  // Fallback - should not happen but just in case
  return (
    <Tooltip title={message || "Order window status unknown"}>
      <Chip
        sx={{ mr: 2 }}
        color="info"
        icon={<AccessTimeIcon />}
        label="Order window open"
        size="small"
      />
    </Tooltip>
  );
}
