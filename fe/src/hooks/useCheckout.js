// src/hooks/useCheckout.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { saveAs } from "file-saver";
import { orderApi } from "../services/api"; // ✅ Correct import

export const useCheckout = () => {
  const qc = useQueryClient();

  const mCreate = useMutation({ mutationFn: orderApi.createOrder });
  const mExport = useMutation({ mutationFn: orderApi.exportPdf });
  const mUpload = useMutation({
    mutationFn: ({ id, fd }) => orderApi.uploadSignedPdf(id, fd),
  });
  const mConfirm = useMutation({ mutationFn: orderApi.confirmOrder });

  const createAndExport = async (body) => {
    const { data } = await mCreate.mutateAsync(body);
    const pdf = await mExport.mutateAsync(data.orderId);
    saveAs(new Blob([pdf.data]), `order-${data.orderId}.pdf`);
    return data.orderId;
  };

  return { mCreate, mExport, mUpload, mConfirm, createAndExport };
};
