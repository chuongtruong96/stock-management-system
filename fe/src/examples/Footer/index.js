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
 * Compact Footer component for internal use
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
        py: { xs: 3, md: 4 },
        mt: "auto",
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={3}>
          {/* Main Footer Content */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            justifyContent="space-between"
            alignItems={{ xs: "center", md: "flex-start" }}
          >
            {/* Company Info */}
            <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="h6" fontWeight={700} color="white">
                    📋
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600} color="white">
                    {t('footer.brandName')}
                  </Typography>
                  <Typography variant="caption" color="grey.400">
                    {t('footer.brandSubtitle')}
                  </Typography>
                </Box>
              </Stack>

              {/* Contact Info */}
              <Stack spacing={0.5}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <EmailIcon fontSize="small" sx={{ color: "grey.400" }} />
                  <Typography variant="body2" color="grey.300">
                    nguyenchuong@pmh.com.vn
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <PhoneIcon fontSize="small" sx={{ color: "grey.400" }} />
                  <Typography variant="body2" color="grey.300">
                    +84 903 803 396
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
              <Typography variant="subtitle1" fontWeight={600} color="white" sx={{ mb: 1.5 }}>
                {t('footer.quickLinks')}
              </Typography>
              <Stack spacing={0.5}>
                <Link 
                  component="button"
                  onClick={() => handleLinkClick("/products")}
                  color="grey.300" 
                  underline="hover"
                  variant="body2"
                  sx={{ textAlign: "left" }}
                >
                  {t('footer.browseCatalog')}
                </Link>
                <Link 
                  component="button"
                  onClick={() => handleLinkClick("/order-history")}
                  color="grey.300" 
                  underline="hover"
                  variant="body2"
                  sx={{ textAlign: "left" }}
                >
                  {t('footer.myRequests')}
                </Link>
                <Link 
                  component="button"
                  onClick={() => handleLinkClick("/order-form")}
                  color="grey.300" 
                  underline="hover"
                  variant="body2"
                  sx={{ textAlign: "left" }}
                >
                  {t('footer.newOrder')}
                </Link>
                <Link 
                  component="button"
                  onClick={() => handleLinkClick("/profile")}
                  color="grey.300" 
                  underline="hover"
                  variant="body2"
                  sx={{ textAlign: "left" }}
                >
                  {t('footer.profile')}
                </Link>
                <Link 
                  component="button"
                  onClick={() => handleLinkClick("/notifications")}
                  color="grey.300" 
                  underline="hover"
                  variant="body2"
                  sx={{ textAlign: "left" }}
                >
                  {t('footer.notifications')}
                </Link>
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
                © {currentYear} {t('footer.copyright')}
              </Typography>
              <FavoriteIcon fontSize="small" sx={{ color: "red" }} />
              <Typography variant="body2">
                {t('footer.madeBy')} {company.name}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={3}>
              <Link href="#" color="grey.400" underline="hover" variant="body2">
                {t('footer.privacyPolicy')}
              </Link>
              <Link href="#" color="grey.400" underline="hover" variant="body2">
                {t('footer.termsOfService')}
              </Link>
              <Link href="#" color="grey.400" underline="hover" variant="body2">
                {t('footer.help')}
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
