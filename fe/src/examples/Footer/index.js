import PropTypes from "prop-types";
import {
  Box,
  Container,
  Typography,
  Stack,
  Divider,
  Link,
  IconButton,
  Chip,
} from "@mui/material";
import {
  Favorite as FavoriteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  GitHub as GitHubIcon,
  LinkedIn as LinkedInIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

/**
 * Enhanced Footer component with modern design
 */
function Footer({ company }) {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "grey.900",
        color: "white",
        py: { xs: 4, md: 6 },
        mt: "auto",
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={4}>
          {/* Main Footer Content */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={4}
            justifyContent="space-between"
            alignItems={{ xs: "center", md: "flex-start" }}
          >
            {/* Company Info */}
            <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 16px rgba(102, 126, 234, 0.3)",
                  }}
                >
                  <Typography variant="h5" fontWeight={700} color="white">
                    📋
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700} color="white">
                    Stationery Management
                  </Typography>
                  <Typography variant="caption" color="grey.400">
                    System
                  </Typography>
                </Box>
              </Stack>
              
              <Typography variant="body2" color="grey.300" sx={{ maxWidth: 300, mb: 2 }}>
                Streamline your office supplies with our comprehensive stationery management system.
              </Typography>

              {/* Contact Info */}
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <EmailIcon fontSize="small" sx={{ color: "grey.400" }} />
                  <Typography variant="body2" color="grey.300">
                    support@stationery.com
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <PhoneIcon fontSize="small" sx={{ color: "grey.400" }} />
                  <Typography variant="body2" color="grey.300">
                    +84 123 456 789
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <LocationIcon fontSize="small" sx={{ color: "grey.400" }} />
                  <Typography variant="body2" color="grey.300">
                    Ho Chi Minh City, Vietnam
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            {/* Quick Links */}
            <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
              <Typography variant="h6" fontWeight={600} color="white" sx={{ mb: 2 }}>
                Quick Links
              </Typography>
              <Stack spacing={1}>
                <Link href="/products" color="grey.300" underline="hover">
                  Products
                </Link>
                <Link href="/order-history" color="grey.300" underline="hover">
                  Order History
                </Link>
                <Link href="/profile" color="grey.300" underline="hover">
                  Profile
                </Link>
                <Link href="/notifications" color="grey.300" underline="hover">
                  Notifications
                </Link>
              </Stack>
            </Box>

            {/* Features */}
            <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
              <Typography variant="h6" fontWeight={600} color="white" sx={{ mb: 2 }}>
                Features
              </Typography>
              <Stack spacing={1}>
                <Chip
                  label="Fast Delivery"
                  size="small"
                  variant="outlined"
                  sx={{ color: "grey.300", borderColor: "grey.600" }}
                />
                <Chip
                  label="Secure Ordering"
                  size="small"
                  variant="outlined"
                  sx={{ color: "grey.300", borderColor: "grey.600" }}
                />
                <Chip
                  label="24/7 Support"
                  size="small"
                  variant="outlined"
                  sx={{ color: "grey.300", borderColor: "grey.600" }}
                />
                <Chip
                  label="Real-time Tracking"
                  size="small"
                  variant="outlined"
                  sx={{ color: "grey.300", borderColor: "grey.600" }}
                />
              </Stack>
            </Box>

            {/* Social Links */}
            <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
              <Typography variant="h6" fontWeight={600} color="white" sx={{ mb: 2 }}>
                Connect
              </Typography>
              <Stack direction="row" spacing={1} justifyContent={{ xs: "center", md: "flex-start" }}>
                <IconButton
                  sx={{
                    color: "grey.400",
                    "&:hover": {
                      color: "white",
                      bgcolor: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  <GitHubIcon />
                </IconButton>
                <IconButton
                  sx={{
                    color: "grey.400",
                    "&:hover": {
                      color: "white",
                      bgcolor: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  <LinkedInIcon />
                </IconButton>
                <IconButton
                  sx={{
                    color: "grey.400",
                    "&:hover": {
                      color: "white",
                      bgcolor: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  <EmailIcon />
                </IconButton>
              </Stack>
            </Box>
          </Stack>

          <Divider sx={{ borderColor: "grey.700" }} />

          {/* Bottom Footer */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ color: "grey.400" }}
            >
              <Typography variant="body2">
                © {currentYear} Stationery Management System. Made with
              </Typography>
              <FavoriteIcon fontSize="small" sx={{ color: "red" }} />
              <Typography variant="body2">
                by {company.name}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={3}>
              <Link href="#" color="grey.400" underline="hover" variant="body2">
                Privacy Policy
              </Link>
              <Link href="#" color="grey.400" underline="hover" variant="body2">
                Terms of Service
              </Link>
              <Link href="#" color="grey.400" underline="hover" variant="body2">
                Help
              </Link>
            </Stack>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

Footer.defaultProps = {
  company: { name: "PMH Development Company" },
};

Footer.propTypes = {
  company: PropTypes.shape({ 
    name: PropTypes.string.isRequired 
  }),
};

export default Footer;
