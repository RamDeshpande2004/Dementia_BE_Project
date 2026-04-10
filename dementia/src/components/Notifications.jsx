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
        <Stack spacing={2}>
          {alerts.map((a) => {
            const typeColors = {
              info: { bg: "#eff6ff", border: "#0066cc", icon: "#0066cc", bgHover: "#e0eeff" },
              warning: { bg: "#fffbf0", border: "#f59e0b", icon: "#f59e0b", bgHover: "#fffbeb" },
              error: { bg: "#fef2f2", border: "#ef4444", icon: "#dc2626", bgHover: "#fff5f5" },
              success: { bg: "#f0fdf4", border: "#10b981", icon: "#10b981", bgHover: "#dcfce7" }
            };
            const colors = typeColors[a.type] || typeColors.info;
            
            return (
              <Paper
                key={a.id}
                sx={{
                  p: 2,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 2,
                  borderRadius: 2,
                  backgroundColor: colors.bg,
                  border: `1.5px solid ${colors.border}`,
                  borderLeft: `5px solid ${colors.border}`,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "2px",
                    background: `linear-gradient(90deg, ${colors.border} 0%, transparent 100%)`,
                    opacity: 0,
                    transition: "opacity 0.3s ease"
                  },
                  "&:hover": {
                    backgroundColor: colors.bgHover,
                    transform: "translateY(-4px) translateX(6px)",
                    boxShadow: `0 10px 25px rgba(${colors.border === "#0066cc" ? "0,102,204" : colors.border === "#f59e0b" ? "245,158,11" : colors.border === "#ef4444" ? "239,68,68" : "16,185,129"}, 0.15)`,
                    borderColor: colors.border,
                    "&::before": {
                      opacity: 1
                    }
                  }
                }}
                elevation={0}
              >
                <Box sx={{ pt: 0.25, display: "flex", alignItems: "center" }}>
                  <Box sx={{ fontSize: 22, display: "flex", animation: "pulse 2s infinite" }}>
                    {getAlertIcon(a.type)}
                  </Box>
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: colors.border, textTransform: "uppercase", letterSpacing: "0.3px", mb: 0.5 }}>
                    {a.time}
                  </Typography>
                  <Typography sx={{ fontWeight: 600, color: isLight ? "#111827" : "#f1f5f9", fontSize: 14 }}>
                    {a.msg}
                  </Typography>
                </Box>
              </Paper>
            );
          })}
        </Stack>
      ) : (
        <Box sx={{ p: 2, textAlign: "center", borderRadius: 2, backgroundColor: isLight ? "#f0fdf4" : "#1e3a2d", border: "1.5px dashed #10b981" }}>
          <Typography sx={{ color: isLight ? "#10b981" : "#86efac", fontWeight: 600, fontSize: 14 }}>
            ✅ {T.noAlerts}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
