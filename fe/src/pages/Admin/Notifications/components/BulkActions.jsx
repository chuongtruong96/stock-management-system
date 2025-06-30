import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Checkbox,
  Divider,
  useTheme,
  alpha,
  Slide
} from '@mui/material';
import {
  MarkEmailRead as MarkReadIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  SelectAll as SelectAllIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const BulkActions = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onMarkAllRead,
  onDeleteAll,
  onClearSelection
}) => {
  const { t } = useTranslation('notifications');
  const theme = useTheme();

  const isAllSelected = selectedCount === totalCount;
  const isIndeterminate = selectedCount > 0 && selectedCount < totalCount;

  return (
    <Slide direction="up" in={selectedCount > 0} mountOnEnter unmountOnExit>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.2 }}
      >
        <Paper
          elevation={4}
          sx={{
            p: 2,
            mb: 2,
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            borderRadius: 2
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <Checkbox
                checked={isAllSelected}
                indeterminate={isIndeterminate}
                onChange={onSelectAll}
                sx={{
                  color: theme.palette.primary.main,
                  '&.Mui-checked': {
                    color: theme.palette.primary.main,
                  },
                }}
              />
              
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {selectedCount === 1 
                  ? t('oneSelected')
                  : t('multipleSelected', { count: selectedCount })
                }
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                {t('outOf', { total: totalCount })}
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<MarkReadIcon />}
                onClick={onMarkAllRead}
                sx={{
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    borderColor: theme.palette.primary.main,
                  }
                }}
              >
                {t('markAsRead')}
              </Button>

              <Button
                variant="outlined"
                size="small"
                startIcon={<DeleteIcon />}
                onClick={onDeleteAll}
                sx={{
                  borderColor: theme.palette.error.main,
                  color: theme.palette.error.main,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                    borderColor: theme.palette.error.main,
                  }
                }}
              >
                {t('delete')}
              </Button>

              <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

              <IconButton
                size="small"
                onClick={onClearSelection}
                sx={{ color: 'text.secondary' }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Quick actions hint */}
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {t('bulkActionsHint')}
            </Typography>
          </Box>
        </Paper>
      </motion.div>
    </Slide>
  );
};

export default BulkActions;