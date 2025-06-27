// Toast utility functions for better notification handling
import { toast } from 'react-toastify';

export const toastUtils = {
  // Safe loading toast that can be properly dismissed
  loading: (message) => {
    const id = toast.loading(message);
    console.log('🔍 Toast: Created loading toast with ID:', id);
    return id;
  },

  // Safe dismiss that handles both ID and toast object
  dismiss: (toastId) => {
    if (toastId) {
      console.log('🔍 Toast: Dismissing toast with ID:', toastId);
      toast.dismiss(toastId);
    }
  },

  // Safe update that dismisses first then shows new toast
  updateToSuccess: (toastId, message, options = {}) => {
    if (toastId) {
      toast.dismiss(toastId);
    }
    return toast.success(message, { autoClose: 2000, ...options });
  },

  // Safe update that dismisses first then shows error
  updateToError: (toastId, message, options = {}) => {
    if (toastId) {
      toast.dismiss(toastId);
    }
    return toast.error(message, { autoClose: 5000, ...options });
  },

  // Clear all toasts
  dismissAll: () => {
    console.log('🔍 Toast: Dismissing all toasts');
    toast.dismiss();
  }
};

export default toastUtils;