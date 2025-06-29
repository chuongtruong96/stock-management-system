// src/components/OrderProgress.jsx
import { 
  Stepper, 
  Step, 
  StepLabel, 
  Box, 
  Typography, 
  Chip,
  Paper,
  Stack,
  useTheme
} from "@mui/material";
import {
  HourglassEmpty,
  PictureAsPdf,
  CloudUpload,
  Send,
  CheckCircle,
  Cancel,
  AdminPanelSettings
} from "@mui/icons-material";

const STEPS = [
  { 
    key: "pending", 
    label: "Order Created", 
    icon: <HourglassEmpty />,
    description: "Your order has been created successfully",
    color: "info"
  },
  { 
    key: "exported", 
    label: "PDF Exported", 
    icon: <PictureAsPdf />,
    description: "Order form downloaded for signature",
    color: "warning"
  },
  { 
    key: "uploaded", 
    label: "Signed PDF Uploaded", 
    icon: <CloudUpload />,
    description: "Signed document uploaded successfully",
    color: "secondary"
  },
  { 
    key: "submitted", 
    label: "Submitted for Approval", 
    icon: <Send />,
    description: "Order sent to admin for review",
    color: "primary"
  },
  { 
    key: "approved", 
    label: "Admin Approved", 
    icon: <CheckCircle />,
    description: "Order approved and will be processed",
    color: "success"
  },
];

export default function OrderProgress({ status }) {
  const theme = useTheme();
  const rejected = status === "rejected";
  
  // Find current step index
  let activeStep = STEPS.findIndex((s) => s.key === status);
  if (activeStep === -1) {
    // Handle 'uploaded' status which maps to step 2
    if (status === "uploaded") activeStep = 2;
    else activeStep = 0;
  }
  
  // If rejected, show as failed at submission step
  if (rejected) {
    activeStep = 4;
  }

  const currentStep = STEPS[activeStep];
  
  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 4, 
        borderRadius: 3,
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Current Status Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            background: rejected 
              ? 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)'
              : `linear-gradient(135deg, ${theme.palette[currentStep?.color || 'primary'].main} 0%, ${theme.palette[currentStep?.color || 'primary'].dark} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          {rejected ? <Cancel /> : currentStep?.icon}
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={600} color="text.primary">
            {rejected ? "Order Rejected" : currentStep?.label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {rejected ? "Your order has been rejected by admin" : currentStep?.description}
          </Typography>
        </Box>
        <Box sx={{ ml: 'auto' }}>
          <Chip
            label={rejected ? "REJECTED" : status?.toUpperCase()}
            color={rejected ? "error" : currentStep?.color || "default"}
            variant="filled"
            sx={{ 
              fontWeight: 600,
              fontSize: '0.8rem',
              px: 2
            }}
          />
        </Box>
      </Stack>

      {/* Progress Stepper */}
      <Stepper 
        activeStep={activeStep} 
        alternativeLabel
        sx={{
          '& .MuiStepLabel-root .Mui-completed': {
            color: 'success.main',
          },
          '& .MuiStepLabel-root .Mui-active': {
            color: rejected ? 'error.main' : 'primary.main',
          },
          '& .MuiStepLabel-root .Mui-active .MuiStepIcon-root': {
            transform: 'scale(1.2)',
            transition: 'transform 0.3s ease-in-out',
          },
          '& .MuiStepConnector-line': {
            borderTopWidth: 3,
          },
          '& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line': {
            borderColor: 'success.main',
          },
          '& .MuiStepConnector-root.Mui-active .MuiStepConnector-line': {
            borderColor: rejected ? 'error.main' : 'primary.main',
          },
        }}
      >
        {STEPS.map(({ key, label, icon }, idx) => {
          const isCompleted = idx < activeStep && !rejected;
          const isActive = idx === activeStep;
          const isFailed = rejected && idx === activeStep;
          
          return (
            <Step key={key} completed={isCompleted}>
              <StepLabel 
                icon={
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: isCompleted 
                        ? 'success.main' 
                        : isActive 
                          ? (isFailed ? 'error.main' : 'primary.main')
                          : 'grey.300',
                      color: 'white',
                      transition: 'all 0.3s ease-in-out',
                      transform: isActive ? 'scale(1.1)' : 'scale(1)',
                      boxShadow: isActive 
                        ? `0 4px 12px ${isFailed ? 'rgba(244, 67, 54, 0.4)' : 'rgba(102, 126, 234, 0.4)'}` 
                        : 'none',
                    }}
                  >
                    {isFailed ? <Cancel /> : (isCompleted ? <CheckCircle /> : icon)}
                  </Box>
                }
                sx={{
                  '& .MuiStepLabel-label': {
                    fontWeight: isActive ? 600 : 400,
                    color: isActive 
                      ? (isFailed ? 'error.main' : 'primary.main')
                      : isCompleted 
                        ? 'success.main'
                        : 'text.secondary',
                    fontSize: isActive ? '0.9rem' : '0.8rem',
                    mt: 1,
                  },
                }}
              >
                {isFailed && idx === activeStep ? "Rejected" : label}
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>

      {/* Progress Bar */}
      <Box sx={{ mt: 3 }}>
        <Box
          sx={{
            width: '100%',
            height: 8,
            borderRadius: 4,
            bgcolor: 'grey.200',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              width: `${((activeStep + 1) / STEPS.length) * 100}%`,
              height: '100%',
              background: rejected 
                ? 'linear-gradient(90deg, #f44336 0%, #d32f2f 100%)'
                : 'linear-gradient(90deg, #4caf50 0%, #2e7d32 100%)',
              borderRadius: 4,
              transition: 'width 0.5s ease-in-out',
            }}
          />
        </Box>
        <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Step {activeStep + 1} of {STEPS.length}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {Math.round(((activeStep + 1) / STEPS.length) * 100)}% Complete
          </Typography>
        </Stack>
      </Box>
    </Paper>
  );
}
