import { useEffect } from "react";
import {
  Stepper,
  Step,
  StepLabel,
  Chip,
  Box,
  Typography,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../../context/CartContext/useCart";
import { useCheckout } from "hooks/useCheckout";

const steps = ["Export PDF", "Upload Signed PDF", "Confirm Order"];

export default function CheckoutStepper() {
  const navigate = useNavigate();
  const { items, clear } = useCart();
  const {
    step,
    exporting,
    uploading,
    confirming,
    exportPdf,
    uploadPdf,
    confirmOrder,
  } = useCheckout(items);

  useEffect(() => {
    if (!items.length) navigate("/products");
  }, [items, navigate]);

  return (
    <Box p={3} maxWidth={600} mx="auto">
      <Typography variant="h4" gutterBottom>
        Checkout
      </Typography>

      <Stepper activeStep={step} alternativeLabel>
        {steps.map((l) => (
          <Step key={l}>
            <StepLabel>{l}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {step === 0 && (
        <Box textAlign="center" mt={4}>
          <Button variant="contained" disabled={exporting} onClick={exportPdf}>
            {exporting ? "Generating…" : "Export PDF"}
          </Button>
        </Box>
      )}

      {step === 1 && (
        <Box textAlign="center" mt={4}>
          <Button variant="contained" component="label" disabled={uploading}>
            {uploading ? "Uploading…" : "Upload Signed PDF"}
            <input
              hidden
              type="file"
              accept="application/pdf"
              onChange={uploadPdf}
            />
          </Button>
        </Box>
      )}

      {step === 2 && (
        <Box textAlign="center" mt={4}>
          <Button
            variant="contained"
            disabled={confirming}
            onClick={confirmOrder}
          >
            {confirming ? "Sending…" : "Confirm Order"}
          </Button>
        </Box>
      )}

      {step === 3 && (
        <Box textAlign="center" mt={4}>
          <Chip color="success" label="Order Created!" />
          <Button
            sx={{ mt: 2 }}
            onClick={() => {
              clear();
              navigate("/order-history");
            }}
          >
            View Order History
          </Button>
        </Box>
      )}
    </Box>
  );
}
