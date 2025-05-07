/* ----------------------------------------------------------------------
   Material Dashboard 2 ‑ Sign‑in screen + business logic in ONE component
   -------------------------------------------------------------------- */

   import { useState, useContext } from "react";
   import { useNavigate, Link }   from "react-router-dom";
   import { jwtDecode }          from "jwt-decode";
   
   /* ---------- 3ʳᵈ‑party / template stuff ---------- */
   import Card        from "@mui/material/Card";
   import Switch      from "@mui/material/Switch";

   import CircularProgress from "@mui/material/CircularProgress";
   
   import MDBox        from "components/MDBox";
   import MDTypography from "components/MDTypography";
   import MDInput      from "components/MDInput";
   import MDButton     from "components/MDButton";
   import BasicLayout  from "layouts/authentication/components/BasicLayout";
   import bgImage      from "assets/images/bg-sign-in-basic.jpeg";
   import { toast }    from "react-toastify";
   
   /* ---------- your business modules ---------- */
   import { login as apiLogin }   from "services/api";
   import { AuthContext }         from "context/AuthContext";
   
   /* =========================================================================
      Main component
      =======================================================================*/
   export default function SignIn() {
     /* ---------------- state ---------------- */
     const [username,  setUsername]  = useState("");
     const [password,  setPassword]  = useState("");
     const [remember,  setRemember]  = useState(
       localStorage.getItem("rememberMe")==="true"
     );
     const [loading,   setLoading]   = useState(false);
   
     /* ---------------- helpers / deps ---------------- */
     const { login: authLogin } = useContext(AuthContext);
     const navigate  = useNavigate();
   
     const handleSubmit = async () => {
       if (!username.trim() || !password.trim()) {
         toast.error("Username / password required");
         return;
       }
       setLoading(true);
       try {
         const { data } = await apiLogin({ username, password });
         const token    = data.token;
         const decoded  = jwtDecode(token);
   
         /*  ‑‑ save in global Auth context ‑‑ */
         authLogin({
           token,
           username: decoded.sub ?? username,
           roles   : decoded.role ? [decoded.role] : decoded.roles,
         });
   
         toast.success("Logged in");
         navigate("/", { replace: true });
       } catch (err) {
         toast.error(err?.response?.data || "Login failed");
       } finally {
         setLoading(false);
       }
     };
   
     /* =========================================================================
        UI – template markup kept intact, only wired to state/handlers
        =======================================================================*/
     return (
       <BasicLayout image={bgImage} hideNav hideFooter> 
         <Card>
           {/* ---------- header gradient ---------- */}
           <MDBox
             variant="gradient" bgColor="info" coloredShadow="info"
             mx={2} mt={-3} p={2} mb={1} textAlign="center" borderRadius="lg"
           >
             <MDTypography variant="h4" fontWeight="medium" color="white">
               Sign in
             </MDTypography>
   
             
           </MDBox>
   
           {/* ---------- form ---------- */}
           <MDBox pt={4} pb={3} px={3}>
             <MDBox component="form" role="form"
                    onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
   
               <MDBox mb={2}>
                 <MDInput
                   type="text" label="Username" fullWidth
                   value={username} onChange={e=>setUsername(e.target.value)}
                 />
               </MDBox>
   
               <MDBox mb={2}>
                 <MDInput
                   type="password" label="Password" fullWidth
                   value={password} onChange={e=>setPassword(e.target.value)}
                 />
               </MDBox>
   
               <MDBox display="flex" alignItems="center" ml={-1}>
                 <Switch
                   checked={remember}
                   onChange={e=>{
                     const v=e.target.checked;
                     setRemember(v);
                     localStorage.setItem("rememberMe", v);
                   }}
                 />
                 <MDTypography
                   variant="button" color="text" sx={{ cursor:"pointer", userSelect:"none", ml:-1 }}
                   onClick={()=>{
                     const v=!remember;
                     setRemember(v);
                     localStorage.setItem("rememberMe", v);
                   }}
                 >
                   &nbsp;&nbsp;Remember&nbsp;me
                 </MDTypography>
               </MDBox>
   
               <MDBox mt={4} mb={1}>
                 <MDButton
                   type="button" variant="gradient" color="info" fullWidth
                   onClick={handleSubmit} disabled={loading}
                 >
                   {loading ? <CircularProgress size={22} color="inherit"/> : "sign in"}
                 </MDButton>
               </MDBox>
   
               
             </MDBox>
           </MDBox>
         </Card>
       </BasicLayout>
     );
   }
   