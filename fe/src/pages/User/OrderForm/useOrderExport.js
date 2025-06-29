// src/pages/User/OrderForm/useOrderExport.js
import { orderApi } from "services/api";
import { toast } from "react-toastify";

export function useOrderExport(order, setOrder) {
  const exportPDF = async () => {
    try {
      console.log('🔍 EXPORT: Starting PDF export for order:', order.orderId || order.id);
      
      // Get the order ID (handle both orderId and id properties)
      const orderId = order.orderId || order.id;
      if (!orderId) {
        throw new Error('Order ID not found');
      }

      // Call the export API - this returns a Blob
      console.log('🔍 EXPORT: Calling orderApi.export...');
      const response = await orderApi.export(orderId);
      console.log('🔍 EXPORT: Export API response:', response);

      // Handle the blob response for PDF download
      let blob;
      if (response instanceof Blob) {
        blob = response;
      } else if (response.data instanceof Blob) {
        blob = response.data;
      } else {
        console.error('🔍 EXPORT: Unexpected response format:', response);
        throw new Error('Invalid response format from export API');
      }

      console.log('🔍 EXPORT: Blob received, size:', blob.size, 'type:', blob.type);

      // Validate blob size
      if (blob.size === 0) {
        throw new Error('PDF generation failed - empty file received from server');
      }

      // Validate blob type
      if (blob.type !== 'application/pdf') {
        console.warn('🔍 EXPORT: Unexpected blob type:', blob.type);
      }

      // Create download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `order-${orderId}.pdf`;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      window.URL.revokeObjectURL(url);

      console.log('🔍 EXPORT: PDF download triggered successfully');

      // Update order status to 'exported'
      setOrder(prev => ({ 
        ...prev, 
        status: 'exported',
        updatedAt: new Date().toISOString()
      }));
      
      toast.success("PDF exported successfully! Please get it signed and upload back.");
    } catch (e) {
      console.error('🔍 EXPORT: Export failed:', e);
      toast.error(`Failed to export PDF: ${e.message}`);
      throw e; // Re-throw so the calling component can handle it
    }
  };

  const markSubmitted = () =>
    setOrder((prev) => ({ ...prev, status: "submitted" }));

  return { exportPDF, markSubmitted };
}
