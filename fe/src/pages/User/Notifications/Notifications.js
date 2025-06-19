// src/pages/User/Notifications/NotificationsPage.jsx
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  Divider,
  Fade,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import InboxIcon from "@mui/icons-material/Inbox";
import DataTable from "examples/Tables/DataTable";

import { useNotifications } from "context/NotificationContext";
import { buildTable } from "./tableData";
import { useTranslation } from "react-i18next";

export default function NotificationsPage() {
  const { t } = useTranslation();
  const { items, markAsRead, markAll } = useNotifications();
  const [table, setTable] = useState({ columns: [], rows: [] });

  useEffect(() => {
    setTable(buildTable(items, markAsRead, t));
  }, [items, markAsRead, t]);

  return (
    <Fade in timeout={500}>
      <Box sx={{ py: 4 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <NotificationsIcon color="primary" />
            <Typography variant="h5" fontWeight={600}>
              {t("notifications") || "Notifications"}
            </Typography>
          </Stack>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            disabled={!items.some((n) => !n.read)}
            onClick={markAll}
          >
            {t("markAllRead") || "Mark all as read"}
          </Button>
        </Stack>

        {items.length === 0 ? (
          <Paper elevation={0} sx={{ py: 6, textAlign: "center" }}>
            <InboxIcon color="disabled" sx={{ fontSize: 64, mb: 2 }} />
            <Typography variant="subtitle1" color="text.secondary">
              {t("noNotifications") || "No notifications"}
            </Typography>
          </Paper>
        ) : (
          <>
            <Divider sx={{ mb: 2 }} />
            <DataTable
              table={table}
              canSearch
              entriesPerPage={false}
              showTotalEntries={false}
              noEndBorder
            />
          </>
        )}
      </Box>
    </Fade>
  );
}
