// src/components/dialogs/UploadSignedDialog.jsx
import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  LinearProgress,
  Stack,
  Paper,
  Chip,
  IconButton,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Close as CloseIcon,
  PictureAsPdf as PdfIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

/**
 * Enhanced upload dialog for signed PDF files
 */
const UploadSignedDialog = ({ open, order, onClose, onUpload }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  // File validation
  const validateFile = useCallback((file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['application/pdf'];

    if (!allowedTypes.includes(file.type)) {
      return 'Only PDF files are allowed';
    }

    if (file.size > maxSize) {
      return 'File size must be less than 5MB';
    }

    return null;
  }, []);

  // Handle file drop/selection
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError(null);

    if (rejectedFiles.length > 0) {
      setError('Invalid file type. Please select a PDF file.');
      return;
    }

    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      const validationError = validateFile(selectedFile);

      if (validationError) {
        setError(validationError);
        return;
      }

      setFile(selectedFile);
    }
  }, [validateFile]);

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    multiple: false,
  });

  // Handle upload
  const handleUpload = async () => {
    if (!file || !order) return;

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Simulate upload progress (replace with actual progress tracking)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await onUpload(file);

      // Complete progress
      setUploadProgress(100);
      clearInterval(progressInterval);

      // Reset state
      setTimeout(() => {
        setFile(null);
        setUploadProgress(0);
        setUploading(false);
      }, 1000);

    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle dialog close
  const handleClose = () => {
    if (uploading) return; // Prevent closing during upload
    
    setFile(null);
    setError(null);
    setUploadProgress(0);
    onClose();
  };

  // Remove selected file
  const removeFile = () => {
    setFile(null);
    setError(null);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box sx={{ fontSize: '1.5rem' }}>📤</Box>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Upload Signed PDF
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Order #{order?.orderId || 'N/A'}
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={handleClose} disabled={uploading}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {/* Instructions */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Please upload the PDF file that has been signed by your department head.
            The file must be in PDF format and less than 5MB.
          </Typography>
        </Alert>

        {/* Upload Area */}
        {!file && (
          <Paper
            {...getRootProps()}
            sx={{
              p: 4,
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'grey.300',
              borderRadius: 2,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: isDragActive ? 'primary.light' : 'grey.50',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'primary.light',
              },
            }}
          >
            <input {...getInputProps()} />
            <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {isDragActive ? 'Drop the PDF file here' : 'Drag & drop PDF file here'}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              or click to browse files
            </Typography>
            <Chip label="PDF files only" size="small" variant="outlined" />
          </Paper>
        )}

        {/* Selected File */}
        {file && (
          <Paper sx={{ p: 3, bgcolor: 'success.light', borderRadius: 2 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <PdfIcon sx={{ fontSize: 40, color: 'error.main' }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {file.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </Typography>
              </Box>
              <Stack alignItems="center" spacing={1}>
                <CheckIcon sx={{ color: 'success.main' }} />
                {!uploading && (
                  <Button size="small" onClick={removeFile} color="error">
                    Remove
                  </Button>
                )}
              </Stack>
            </Stack>
          </Paper>
        )}

        {/* Upload Progress */}
        {uploading && (
          <Box sx={{ mt: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="body2">Uploading...</Typography>
              <Typography variant="body2" fontWeight={600}>
                {uploadProgress}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={uploadProgress}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                },
              }}
            />
          </Box>
        )}

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button
          onClick={handleClose}
          disabled={uploading}
          size="large"
        >
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          variant="contained"
          size="large"
          startIcon={uploading ? null : <UploadIcon />}
          sx={{ minWidth: 120 }}
        >
          {uploading ? 'Uploading...' : 'Upload PDF'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

UploadSignedDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  order: PropTypes.shape({
    orderId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  onClose: PropTypes.func.isRequired,
  onUpload: PropTypes.func.isRequired,
};

export default UploadSignedDialog;