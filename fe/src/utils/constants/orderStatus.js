// src/utils/constants/orderStatus.js

/**
 * Order status configuration with enhanced metadata
 */
export const ORDER_STATUS_CONFIG = {
  pending: {
    code: 'pending',
    label: 'Order Created',
    color: 'info',
    progress: 25,
    description: 'Your order has been created and is ready for PDF export',
    icon: '📝',
    nextAction: 'Export PDF',
    allowedTransitions: ['exported'],
  },
  exported: {
    code: 'exported',
    label: 'PDF Exported',
    color: 'warning',
    progress: 50,
    description: 'PDF has been exported. Please get it signed and upload back',
    icon: '📄',
    nextAction: 'Upload Signed PDF',
    allowedTransitions: ['submitted'],
  },
  submitted: {
    code: 'submitted',
    label: 'Submitted for Approval',
    color: 'primary',
    progress: 75,
    description: 'Signed PDF uploaded. Waiting for admin approval',
    icon: '📤',
    nextAction: 'Waiting for Admin',
    allowedTransitions: ['approved', 'rejected'],
  },
  approved: {
    code: 'approved',
    label: 'Approved',
    color: 'success',
    progress: 100,
    description: 'Your order has been approved and will be processed',
    icon: '✅',
    nextAction: 'Completed',
    allowedTransitions: [],
  },
  rejected: {
    code: 'rejected',
    label: 'Rejected',
    color: 'error',
    progress: 100,
    description: 'Your order has been rejected. Please check admin comments',
    icon: '❌',
    nextAction: 'Review Comments',
    allowedTransitions: [],
  },
};

/**
 * Order workflow steps for progress tracking
 */
export const ORDER_WORKFLOW_STEPS = [
  {
    id: 'create',
    title: 'Create Order',
    description: 'Add items and create your order',
    status: 'pending',
    icon: '📝',
  },
  {
    id: 'export',
    title: 'Export PDF',
    description: 'Download order form for signature',
    status: 'exported',
    icon: '📄',
  },
  {
    id: 'upload',
    title: 'Upload Signed PDF',
    description: 'Submit signed document',
    status: 'submitted',
    icon: '📤',
  },
  {
    id: 'approval',
    title: 'Admin Approval',
    description: 'Wait for admin review',
    status: 'approved',
    icon: '✅',
  },
];

/**
 * Get order status configuration
 */
export const getOrderStatusConfig = (status) => {
  return ORDER_STATUS_CONFIG[status] || ORDER_STATUS_CONFIG.pending;
};

/**
 * Get current step index based on order status
 */
export const getCurrentStepIndex = (status) => {
  const stepMap = {
    pending: 0,
    exported: 1,
    submitted: 2,
    approved: 3,
    rejected: 3,
  };
  return stepMap[status] || 0;
};

/**
 * Check if status transition is allowed
 */
export const isTransitionAllowed = (fromStatus, toStatus) => {
  const config = getOrderStatusConfig(fromStatus);
  return config.allowedTransitions.includes(toStatus);
};

/**
 * Get next possible actions for a status
 */
export const getNextActions = (status) => {
  const config = getOrderStatusConfig(status);
  return {
    nextAction: config.nextAction,
    allowedTransitions: config.allowedTransitions,
  };
};

/**
 * Order status colors for consistent theming
 */
export const ORDER_STATUS_COLORS = {
  pending: '#2196f3',    // Blue
  exported: '#ff9800',   // Orange
  submitted: '#9c27b0',  // Purple
  approved: '#4caf50',   // Green
  rejected: '#f44336',   // Red
};

/**
 * Get status color
 */
export const getStatusColor = (status) => {
  return ORDER_STATUS_COLORS[status] || ORDER_STATUS_COLORS.pending;
};