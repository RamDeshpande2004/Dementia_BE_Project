import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Select,
  MenuItem,
  Box,
  IconButton,
  Tooltip,
  Avatar,
} from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import FavoriteIcon from "@mui/icons-material/Favorite";

export default function Header({
  T,
  language,
  setLanguage,
  themeMode,
  setThemeMode,
}) {
  const isLight = themeMode === "light";

  return (
    <AppBar
      position="static"
      sx={{
        backdropFilter: "blur(10px)",
        background: isLight
          ? "linear-gradient(90deg, #2563EBcc 0%, #06B6D4cc 100%)"
          : "linear-gradient(90deg, #0F172Acc 0%, #1E293Bcc 100%)",
        boxShadow: isLight
          ? "0 4px 20px rgba(0,0,0,0.2)"
          : "0 4px 20px rgba(255,255,255,0.05)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        transition: "all 0.4s ease",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: { xs: 2, md: 4 },
          py: 1.5,
        }}
      >
        {/* Logo + Title */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <FavoriteIcon
            sx={{
              color: "#F43F5E",
              fontSize: 30,
              animation: "heartbeat 1.5s infinite",
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "white",
              letterSpacing: "0.5px",
              fontSize: { xs: "1rem", md: "1.25rem" },
            }}
          >
            {T?.title || "Patient Monitoring Dashboard"}
          </Typography>
        </Box>

        {/* Controls: Language, Theme, Avatar */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Language Selector */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              backgroundColor: isLight
                ? "rgba(255,255,255,0.15)"
                : "rgba(255,255,255,0.1)",
              backdropFilter: "blur(8px)",
              borderRadius: "14px",
              px: 1.5,
              py: 0.5,
              transition: "0.3s ease",
              "&:hover": {
                backgroundColor: isLight
                  ? "rgba(255,255,255,0.25)"
                  : "rgba(255,255,255,0.2)",
              },
            }}
          >
            <LanguageIcon sx={{ color: "white", fontSize: 22 }} />
            <Select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              variant="standard"
              disableUnderline
              sx={{
                color: "white",
                fontWeight: 500,
                fontSize: "0.95rem",
                "& .MuiSvgIcon-root": { color: "white" },
                "& .MuiSelect-select": { p: 0.5 },
              }}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="hi">हिन्दी</MenuItem>
              <MenuItem value="mr">मराठी</MenuItem>
            </Select>
          </Box>

          {/* Theme Toggle */}
          <Tooltip
            title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            <IconButton
              onClick={() => setThemeMode(isLight ? "dark" : "light")}
              sx={{
                color: "white",
                backgroundColor: isLight
                  ? "rgba(0,0,0,0.15)"
                  : "rgba(255,255,255,0.15)",
                borderRadius: "12px",
                transition: "0.3s ease",
                "&:hover": {
                  backgroundColor: isLight
                    ? "rgba(0,0,0,0.25)"
                    : "rgba(255,255,255,0.25)",
                  transform: "scale(1.05)",
                },
              }}
            >
              {isLight ? <Brightness4Icon /> : <Brightness7Icon />}
            </IconButton>
          </Tooltip>

          {/* User Avatar */}
          <Tooltip title="Profile">
            <Avatar
              sx={{
                width: 36,
                height: 36,
                border: "2px solid white",
                cursor: "pointer",
                transition: "transform 0.3s ease",
                "&:hover": { transform: "scale(1.1)" },
              }}
            >
              U
            </Avatar>
          </Tooltip>
        </Box>
      </Toolbar>

      {/* Heartbeat animation */}
      <style>
        {`
          @keyframes heartbeat {
            0% { transform: scale(1); }
            25% { transform: scale(1.2); }
            50% { transform: scale(1); }
            75% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </AppBar>
  );
}
