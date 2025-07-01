import PropTypes from "prop-types";
import {
  Box,
  Container,
  Typography,
  Stack,
  Divider,
  Link,
} from "@mui/material";
import {
  Favorite as FavoriteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

/**
 * Compact Footer component for internal use - Minimized version
 */
function Footer({ company }) {
  const navigate = useNavigate();
  const { t } = useTranslation('navigation');
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (path) => {
    navigate(path);
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "grey.900",
        color: "white",
        py: 1.5, // Reduced from 3-4 to 1.5
        mt: "auto",
        borderTop: "1px solid",
        borderTopColor: "grey.700",
      }}
    >
      <Container maxWidth="lg">
        {/* Single Row Compact Footer */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          {/* Left Side - Brand & Copyright */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
          >
            {/* Compact Brand */}
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: 1.5,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="body2" fontWeight={700} color="white">
                  📋
                </Typography>
              </Box>
              <Typography variant="body2" fontWeight={600} color="white">
                {t('footer.brandName') || 'Stationery Management'}
              </Typography>
            </Stack>

            {/* Copyright */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.5}
              sx={{ color: "grey.400", display: { xs: "none", md: "flex" } }}
            >
              <Typography variant="caption">
                © {currentYear}
              </Typography>
              <FavoriteIcon fontSize="small" sx={{ color: "red", fontSize: "0.875rem" }} />
              <Typography variant="caption">
                {company.name}
              </Typography>
            </Stack>
          </Stack>

          {/* Center - Quick Actions (Hidden on mobile) */}
          <Stack 
            direction="row" 
            spacing={2} 
            sx={{ display: { xs: "none", md: "flex" } }}
          >
            <Link 
              component="button"
              onClick={() => handleLinkClick("/products")}
              color="grey.300" 
              underline="hover"
              variant="caption"
              sx={{ 
                fontSize: "0.75rem",
                "&:hover": { color: "white" },
                transition: "color 0.2s ease"
              }}
            >
              {t('footer.browseCatalog') || 'Browse'}
            </Link>
            <Link 
              component="button"
              onClick={() => handleLinkClick("/order-history")}
              color="grey.300" 
              underline="hover"
              variant="caption"
              sx={{ 
                fontSize: "0.75rem",
                "&:hover": { color: "white" },
                transition: "color 0.2s ease"
              }}
            >
              {t('footer.myRequests') || 'Orders'}
            </Link>
            <Link 
              component="button"
              onClick={() => handleLinkClick("/profile")}
              color="grey.300" 
              underline="hover"
              variant="caption"
              sx={{ 
                fontSize: "0.75rem",
                "&:hover": { color: "white" },
                transition: "color 0.2s ease"
              }}
            >
              {t('footer.profile') || 'Profile'}
            </Link>
          </Stack>

          {/* Right Side - Contact & Links */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
          >
            {/* Contact Info */}
            <Stack direction="row" alignItems="center" spacing={1} sx={{ display: { xs: "none", lg: "flex" } }}>
              <EmailIcon fontSize="small" sx={{ color: "grey.400", fontSize: "1rem" }} />
              <Typography variant="caption" color="grey.300">
                nguyenchuong@pmh.com.vn
              </Typography>
            </Stack>

            {/* Legal Links */}
            <Stack direction="row" spacing={1.5} sx={{ display: { xs: "none", sm: "flex" } }}>
              <Link 
                href="#" 
                color="grey.400" 
                underline="hover" 
                variant="caption"
                sx={{ 
                  fontSize: "0.75rem",
                  "&:hover": { color: "white" },
                  transition: "color 0.2s ease"
                }}
              >
                {t('footer.privacyPolicy') || 'Privacy'}
              </Link>
              <Link 
                href="#" 
                color="grey.400" 
                underline="hover" 
                variant="caption"
                sx={{ 
                  fontSize: "0.75rem",
                  "&:hover": { color: "white" },
                  transition: "color 0.2s ease"
                }}
              >
                {t('footer.help') || 'Help'}
              </Link>
            </Stack>
          </Stack>

          {/* Mobile Copyright */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            sx={{ color: "grey.400", display: { xs: "flex", md: "none" } }}
          >
            <Typography variant="caption">
              © {currentYear}
            </Typography>
            <FavoriteIcon fontSize="small" sx={{ color: "red", fontSize: "0.75rem" }} />
            <Typography variant="caption">
              {company.name}
            </Typography>
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
