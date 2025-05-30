// src/components/OrderProgress.jsx
import { Stepper, Step, StepLabel } from "@mui/material";
import HourglassEmpty   from "@mui/icons-material/HourglassEmpty";
import PictureAsPdf     from "@mui/icons-material/PictureAsPdf";
import Publish          from "@mui/icons-material/Publish";
import CheckCircle      from "@mui/icons-material/CheckCircle";
import Cancel           from "@mui/icons-material/Cancel";
import MDBox            from "components/MDBox";

const STEPS = [
  { key:"pending",   label:"Pending",   icon:<HourglassEmpty/>   },
  { key:"exported",  label:"Exported",  icon:<PictureAsPdf/>     },
  { key:"submitted", label:"Submitted", icon:<Publish/>          },
  { key:"approved",  label:"Approved",  icon:<CheckCircle/>      },
];

export default function OrderProgress({ status }) {
  // Nếu bị reject ⇒ để step index 3 và tô đỏ
  const rejected = status === "rejected";
  const active   = rejected ? 3 : STEPS.findIndex(s => s.key === status);
  return (
    <MDBox my={3}>
      <Stepper alternativeLabel activeStep={active}>
        {STEPS.map(({ key,label,icon }, idx)=>(
          <Step
            key={key}
            completed={idx < active && !rejected}
            sx={rejected && idx===3 ? { "& .MuiStepLabel-iconContainer":{ color:"error.main" }} : {}}
          >
            <StepLabel icon={rejected && idx===3 ? <Cancel/> : icon}>
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </MDBox>
  );
}
