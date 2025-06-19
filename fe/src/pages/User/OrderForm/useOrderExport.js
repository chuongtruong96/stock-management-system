// src/pages/User/OrderForm/useOrderExport.js
import { orderApi } from "services/api";
import { toast } from "react-toastify";

export function useOrderExport(order, setOrder) {
  const exportPDF = async () => {
    try {
      const response = await orderApi.export(order.orderId);
      window.open(`/api/orders/${order.orderId}/signed-file`, "_blank");
      setOrder(response);
      toast.success("PDF exported – please get signature");
    } catch (e) {
      toast.error(e.message);
    }
  };

  const markSubmitted = () =>
    setOrder((prev) => ({ ...prev, status: "submitted" }));

  return { exportPDF, markSubmitted };
}
