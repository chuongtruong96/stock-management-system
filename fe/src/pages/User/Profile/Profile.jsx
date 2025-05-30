
import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { toast } from "react-toastify";
import { useAuth } from "context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useOrderHistory } from "hooks/useOrderHistory";
  // variant returns orders list
export default function ProfilePage() {
  const [pwd, setPwd] = React.useState("");
  const handleSubmit = () => {
    // call API change password
    toast.success("Password changed");
  };
  return (
    <Box p={3} maxWidth={480} mx="auto">
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Change Password
      </Typography>
      <input
        type="password"
        placeholder="New password"
        value={pwd}
        onChange={(e) => setPwd(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 16 }}
      />
      <Button variant="contained" onClick={handleSubmit} disabled={!pwd.length}>
        Update
      </Button>
    </Box>
  );
}