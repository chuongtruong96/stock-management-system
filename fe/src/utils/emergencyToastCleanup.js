// Emergency toast cleanup utility
import { toast } from 'react-toastify';

// Function to forcefully clear all stuck toasts
export const emergencyToastCleanup = () => {
  console.log('🚨 Emergency: Clearing all stuck toasts');
  
  // Dismiss all toasts
  toast.dismiss();
  
  // Clear any toast containers that might be stuck
  const toastContainers = document.querySelectorAll('.Toastify__toast-container');
  toastContainers.forEach(container => {
    const toasts = container.querySelectorAll('.Toastify__toast');
    toasts.forEach(toastElement => {
      if (toastElement.classList.contains('Toastify__toast--loading')) {
        console.log('🚨 Emergency: Removing stuck loading toast');
        toastElement.remove();
      }
    });
  });
  
  // Show confirmation
  setTimeout(() => {
    toast.success('All stuck notifications cleared!', { autoClose: 2000 });
  }, 100);
};

// Add to window for emergency access from browser console
if (typeof window !== 'undefined') {
  window.emergencyToastCleanup = emergencyToastCleanup;
  console.log('🔧 Emergency toast cleanup function available as window.emergencyToastCleanup()');
}

export default emergencyToastCleanup;