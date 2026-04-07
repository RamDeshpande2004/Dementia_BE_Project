import React from "react";
import { Card, CardContent, Typography, Box, LinearProgress } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
// import LocationOnIcon from "@mui/icons-material/LocationOn";
import ThermostatIcon from "@mui/icons-material/Thermostat";

export default function PatientSummary({
  // T,
  // data,
  comfort,
  comfortColor,
  // locationName,
  // isOutOfZone,
  themeMode,
}) {
  const isLight = themeMode === "light";

  return (
    <Card
      sx={{
        borderRadius: "20px",
        background: isLight
          ? "linear-gradient(145deg, #ffffff, #f3f4f6)"
          : "linear-gradient(145deg, #1e293b, #0f172a)",
        color: isLight ? "#111827" : "#f9fafb",
        boxShadow: isLight
          ? "10px 10px 30px #d1d9e6, -10px -10px 30px #ffffff"
          : "10px 10px 30px #0f172a, -10px -10px 30px #1e293b",
        p: 3,
        mt: 3,
        transition: "all 0.4s ease",
        "&:hover": {
          transform: "scale(1.02)",
          boxShadow: isLight
            ? "15px 15px 35px #d1d9e6, -15px -15px 35px #ffffff"
            : "15px 15px 35px #0f172a, -15px -15px 35px #1e293b",
        },
      }}
    >
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          { "Patient Summary"}
        </Typography>

        <Box sx={{ display: "grid", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FavoriteIcon sx={{ color: "#f43f5e" }} />
            <Typography>
              <strong>Caregiver:</strong> { "Arti Deshmukh"}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ThermostatIcon sx={{ color: "#2563eb" }} />
            <Typography>
              <strong>Patient:</strong> { "Mrs. Neha Kanaki"}
            </Typography>
          </Box>

          <Typography>
            <strong>Condition:</strong> {"Mild Dementia"}
          </Typography>

          {/* Comfort Level */}
          <Box sx={{ mt: 1 }}>
            <Typography sx={{ mb: 0.5 }}>
              <strong>{comfort}:</strong>
            </Typography>
            <LinearProgress
              variant="determinate"
              value={comfort}
              sx={{
                height: 12,
                borderRadius: 6,
                backgroundColor: isLight ? "#e0e0e0" : "#334155",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: comfortColor,
                  transition: "width 0.5s ease",
                },
              }}
            />
            <Typography sx={{ mt: 0.5, fontWeight: 600, textAlign: "right" }}>
              {comfort.toFixed(0)}%
            </Typography>
          </Box>

          {/* Location */}
          {/* <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
            <LocationOnIcon sx={{ color: isOutOfZone ? "#ef4444" : "#22c55e" }} />
            <Typography>
              <strong>{T.map}:</strong> {locationName} (
              <span
                style={{
                  color: isOutOfZone ? "#ef4444" : "#22c55e",
                  fontWeight: 600,
                }}
              >
                {isOutOfZone ? T.zoneOut : T.zoneIn}
              </span>
              )
            </Typography>
          </Box> */}
        </Box>
      </CardContent>
    </Card>
  );
}
