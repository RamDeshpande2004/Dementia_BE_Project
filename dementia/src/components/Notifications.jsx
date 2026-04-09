import React from "react";
import { Box, Typography, Paper, Stack } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import InfoIcon from "@mui/icons-material/Info";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function Notifications({ alerts, T, themeMode }) {
  const isLight = themeMode === "light";

  const getAlertIcon = (type) => {
    const size = 20;
    const color = isLight ? "#2563eb" : "#38bdf8"; 
    switch (type) {
      case "info":
        return <InfoIcon sx={{ fontSize: size, color }} />;
      case "warning":
        return <WarningIcon sx={{ fontSize: size, color: "#f59e0b" }} />;
      case "error":
        return <ErrorIcon sx={{ fontSize: size, color: "#ef4444" }} />;
      case "success":
        return <CheckCircleIcon sx={{ fontSize: size, color: "#10b981" }} />;
      default:
        return <InfoIcon sx={{ fontSize: size, color }} />;
    }
  };

  return (
    <Box
      sx={{
        mt: 3,
        p: 3,
        borderRadius: 3,
        background: isLight
          ? "linear-gradient(145deg, #ffffff, #f3f4f6)"
          : "linear-gradient(145deg, #1e293b, #0f172a)",
        transition: "all 0.4s ease",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
        <NotificationsIcon sx={{ color: isLight ? "#2563eb" : "#38bdf8", fontSize: 28 }} />
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: isLight ? "#111827" : "#f9fafb" }}
        >
          {T.notifications}
        </Typography>
      </Box>

      {alerts.length ? (
        <Stack spacing={1}>
          {alerts.map((a) => (
            <Paper
              key={a.id}
              sx={{
                p: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                borderRadius: 2,
                backgroundColor: isLight ? "#f9fafb" : "#1e293b",
                border: `1px solid ${isLight ? "#e5e7eb" : "#334155"}`,
                transition: "all 0.3s ease",
              }}
              elevation={0} 
            >
              {getAlertIcon(a.type)}

              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography sx={{ fontSize: 13, color: isLight ? "#6b7280" : "#94a3b8" }}>
                  {a.time}
                </Typography>
                <Typography sx={{ fontWeight: 500, color: isLight ? "#111827" : "#f1f5f9" }}>
                  {a.msg}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Stack>
      ) : (
        <Typography sx={{ mt: 2, color: isLight ? "#6b7280" : "#94a3b8" }}>
          {T.noAlerts}
        </Typography>
      )}
    </Box>
  );
}
