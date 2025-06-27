// src/components/common/DebugInfo.jsx
import React from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';

export default function DebugInfo({ data, title = "Debug Info" }) {
  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9998, maxWidth: 400 }}>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="caption" color="text.secondary">
            🐛 {title}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
            <Typography variant="caption" component="pre" sx={{ fontSize: '0.7rem', whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(data, null, 2)}
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}