import { Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import {
  Breadcrumbs as MuiBreadcrumbs,
  Box,
  Typography,
  Paper,
  Chip,
  Stack,
  Container,
} from "@mui/material";
import {
  Home as HomeIcon,
  ChevronRight as ChevronRightIcon,
  Dashboard as DashboardIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

// Enhanced route to title mapping with translation keys
const routeTitleMap = {
  dashboard: "nav.dashboard",
  admin: "nav.adminDashboard",
  products: "nav.products",
  "order-form": "nav.orderForm",
  "order-history": "nav.orderHistory",
  "order-management": "nav.orderManagement",
  "product-management": "nav.productManagement",
  "category-management": "nav.categoryManagement",
  "user-management": "nav.userManagement",
  "unit-management": "nav.unitManagement",
  orders: "nav.orderDetail",
  profile: "nav.profile",
  notifications: "nav.notifications",
  categories: "nav.categories",
  reports: "nav.reports",
};

function Breadcrumbs({ icon, title, route, light = false }) {
  const { t } = useTranslation();
  const location = useLocation();
  
  const createBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter(x => x);
    const breadcrumbs = [];

    // Check if we're in admin area
    const isAdminArea = location.pathname.startsWith('/admin') || 
                       location.pathname.includes('management') || 
                       location.pathname.includes('reports');

    // Add home breadcrumb only if not on home page
    if (location.pathname !== '/admin' && location.pathname !== '/dashboard' && location.pathname !== '/') {
      breadcrumbs.push({
        label: isAdminArea ? t('nav.adminDashboard') : t('nav.dashboard'),
        path: isAdminArea ? '/admin' : '/dashboard',
        icon: <HomeIcon fontSize="small" />,
        isHome: true,
      });
    }

    // Build breadcrumbs from path
    let currentPath = '';
    pathnames.forEach((pathname, index) => {
      currentPath += `/${pathname}`;
      
      // Skip the last item (current page) and numeric IDs
      if (index < pathnames.length - 1 && !isNumeric(pathname)) {
        const translationKey = routeTitleMap[pathname];
        const label = translationKey ? t(translationKey) : pathname.replace(/[-_]/g, ' ');
        breadcrumbs.push({
          label: label,
          path: currentPath,
          icon: null,
          isHome: false,
        });
      }
    });

    return breadcrumbs;
  };

  const isNumeric = (str) => /^\d+$/.test(str);
  const breadcrumbs = createBreadcrumbs();

  // Convert string icon to React element if needed
  const getIconElement = (iconProp) => {
    if (typeof iconProp === 'string') {
      return <DashboardIcon fontSize="small" />;
    }
    return iconProp;
  };

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3 } }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 3,
          borderRadius: 3,
          bgcolor: light ? 'transparent' : 'rgba(255, 255, 255, 0.9)',
          border: light ? 'none' : '1px solid',
          borderColor: 'divider',
          background: light 
            ? 'transparent' 
            : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,249,250,0.95) 100%)',
          backdropFilter: light ? 'none' : 'blur(20px)',
          boxShadow: light ? 'none' : '0 4px 20px rgba(0,0,0,0.08)',
        }}
      >
        {/* Single Row Layout */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          alignItems={{ xs: 'flex-start', sm: 'center' }} 
          spacing={{ xs: 2, sm: 3 }}
          sx={{ width: '100%' }}
        >
          {/* Icon */}
          {icon && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: { xs: 48, sm: 56 },
                height: { xs: 48, sm: 56 },
                borderRadius: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)',
                flexShrink: 0,
                '& svg': {
                  fontSize: { xs: '1.5rem', sm: '1.8rem' },
                },
              }}
            >
              {getIconElement(icon)}
            </Box>
          )}

          {/* Title and Breadcrumbs */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Breadcrumb Navigation - Compact */}
            {breadcrumbs.length > 0 && (
              <MuiBreadcrumbs
                separator={
                  <ChevronRightIcon 
                    fontSize="small" 
                    sx={{ 
                      color: 'text.secondary',
                      opacity: 0.5,
                    }} 
                  />
                }
                sx={{
                  mb: 1,
                  '& .MuiBreadcrumbs-separator': {
                    mx: 0.5,
                  },
                  '& .MuiBreadcrumbs-ol': {
                    flexWrap: 'nowrap',
                    overflow: 'hidden',
                  },
                }}
              >
                {breadcrumbs.map((crumb, index) => (
                  <Link
                    key={index}
                    to={crumb.path}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                    }}
                  >
                    <Chip
                      icon={crumb.icon}
                      label={crumb.label}
                      variant={crumb.isHome ? "filled" : "outlined"}
                      color={crumb.isHome ? "primary" : "default"}
                      size="small"
                      clickable
                      sx={{
                        textTransform: 'capitalize',
                        fontWeight: crumb.isHome ? 600 : 500,
                        fontSize: '0.75rem',
                        height: 28,
                        maxWidth: 120,
                        '& .MuiChip-label': {
                          px: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        },
                        '& .MuiChip-icon': {
                          fontSize: '1rem',
                          ml: 0.5,
                        },
                        '&:hover': {
                          bgcolor: crumb.isHome ? 'primary.dark' : 'action.hover',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                        },
                        transition: 'all 0.2s ease-in-out',
                        border: crumb.isHome ? 'none' : '1px solid',
                        borderColor: 'divider',
                      }}
                    />
                  </Link>
                ))}
                
                {/* Current Page */}
                <Chip
                  icon={getIconElement(icon)}
                  label={title}
                  variant="filled"
                  color="secondary"
                  size="small"
                  sx={{
                    textTransform: 'capitalize',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    height: 28,
                    maxWidth: 150,
                    '& .MuiChip-label': {
                      px: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    },
                    '& .MuiChip-icon': {
                      fontSize: '1rem',
                      ml: 0.5,
                    },
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                />
              </MuiBreadcrumbs>
            )}

            {/* Page Title */}
            <Typography
              variant="h4"
              fontWeight={700}
              color={light ? 'white' : 'text.primary'}
              sx={{
                textTransform: 'capitalize',
                background: light 
                  ? 'none' 
                  : 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                WebkitBackgroundClip: light ? 'unset' : 'text',
                WebkitTextFillColor: light ? 'inherit' : 'transparent',
                fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' },
                lineHeight: 1.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {title}
            </Typography>
          </Box>

          {/* Path indicator - only on larger screens */}
          <Box sx={{ display: { xs: 'none', md: 'block' }, flexShrink: 0 }}>
            <Typography
              variant="caption"
              color={light ? 'rgba(255,255,255,0.6)' : 'text.secondary'}
              sx={{ 
                fontFamily: 'monospace',
                fontSize: '0.7rem',
                opacity: 0.7,
                bgcolor: light ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                border: '1px solid',
                borderColor: light ? 'rgba(255,255,255,0.2)' : 'divider',
              }}
            >
              {location.pathname}
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}

Breadcrumbs.propTypes = {
  icon: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  title: PropTypes.string.isRequired,
  route: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  light: PropTypes.bool,
};

export default Breadcrumbs;