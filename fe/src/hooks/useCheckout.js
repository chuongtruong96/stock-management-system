// src/hooks/useCheckout.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as O from "../services/api";
import { toast } from "react-toastify";
import { saveAs } from "file-saver";

export const useCheckout = () => {
  const qc = useQueryClient();

  const mCreate = useMutation({ mutationFn: O.createOrder });
  const mExport = useMutation({ mutationFn: O.exportPdf });
  const mUpload = useMutation({ mutationFn: ({ id, fd }) => O.uploadSignedPdf(id, fd) });
  const mConfirm= useMutation({ mutationFn: O.confirmOrder });

  /* wrap helpers that UI calls */
  const createAndExport = async (body) => {
    const { data } = await mCreate.mutateAsync(body);
    const pdf = await mExport.mutateAsync(data.orderId);
    saveAs(new Blob([pdf.data]), `order-${data.orderId}.pdf`);
    return data.orderId;
  };

  return { mCreate, mExport, mUpload, mConfirm, createAndExport };
};