// src/components/OrderProgress.jsx
import { Stepper, Step, StepLabel, Box } from "@mui/material";
import HourglassEmpty from "@mui/icons-material/HourglassEmpty";
import PictureAsPdf from "@mui/icons-material/PictureAsPdf";
import Publish from "@mui/icons-material/Publish";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Cancel from "@mui/icons-material/Cancel";

const STEPS = [
  { key: "pending", label: "Order Created", icon: <HourglassEmpty /> },
  { key: "exported", label: "PDF Exported", icon: <PictureAsPdf /> },
  { key: "submitted", label: "Signed & Submitted", icon: <Publish /> },
  { key: "approved", label: "Admin Approved", icon: <CheckCircle /> },
];

export default function OrderProgress({ status }) {
  // If rejected, show error state
  const rejected = status === "rejected";
  const active = rejected ? 3 : STEPS.findIndex((s) => s.key === status);
  
  return (
    <Box sx={{ my: 3 }}>
      <Stepper alternativeLabel activeStep={active}>
        {STEPS.map(({ key, label, icon }, idx) => (
          <Step
            key={key}
            completed={idx < active && !rejected}
            sx={
              rejected && idx === 3
                ? { "& .MuiStepLabel-iconContainer": { color: "error.main" } }
                : {}
            }
          >
            <StepLabel icon={rejected && idx === 3 ? <Cancel /> : icon}>
              {rejected && idx === 3 ? "Rejected" : label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}
