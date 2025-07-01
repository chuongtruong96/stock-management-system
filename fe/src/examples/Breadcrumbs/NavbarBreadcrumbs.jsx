import { Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import {
  Breadcrumbs as MuiBreadcrumbs,
  Box,
  Typography,
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

function NavbarBreadcrumbs({ icon, title, route, light = false }) {
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
        icon: <HomeIcon fontSize="inherit" />,
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
      return <DashboardIcon fontSize="inherit" />;
    }
    return iconProp;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
      {/* Compact Breadcrumb Navigation */}
      {breadcrumbs.length > 0 && (
        <MuiBreadcrumbs
          separator={
            <ChevronRightIcon 
              fontSize="small" 
              sx={{ 
                color: light ? 'rgba(255,255,255,0.5)' : 'text.secondary',
                opacity: 0.6,
                fontSize: '0.9rem',
              }} 
            />
          }
          sx={{
            mb: 0.5,
            '& .MuiBreadcrumbs-separator': {
              mx: 0.3,
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
                minWidth: 0,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: light ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                  textTransform: 'capitalize',
                  fontSize: '0.7rem',
                  fontWeight: crumb.isHome ? 600 : 400,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.3,
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '120px',
                  '&:hover': {
                    color: light ? 'white' : 'primary.main',
                  },
                  transition: 'color 0.2s ease',
                }}
              >
                {crumb.icon && (
                  <Box component="span" sx={{ fontSize: '0.8rem', display: 'flex' }}>
                    {crumb.icon}
                  </Box>
                )}
                {crumb.label}
              </Typography>
            </Link>
          ))}
        </MuiBreadcrumbs>
      )}

      {/* Page Title */}
      <Typography
        variant="h6"
        fontWeight={600}
        color={light ? 'white' : 'text.primary'}
        sx={{
          textTransform: 'capitalize',
          fontSize: '1rem',
          lineHeight: 1.2,
          display: 'flex',
          alignItems: 'center',
          gap: 0.8,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {icon && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 24,
              height: 24,
              borderRadius: 1,
              background: light 
                ? 'rgba(255,255,255,0.2)' 
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              flexShrink: 0,
              '& svg': {
                fontSize: '0.9rem',
              },
            }}
          >
            {getIconElement(icon)}
          </Box>
        )}
        <Box component="span" sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {title}
        </Box>
      </Typography>
    </Box>
  );
}

NavbarBreadcrumbs.propTypes = {
  icon: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  title: PropTypes.string.isRequired,
  route: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  light: PropTypes.bool,
};

export default NavbarBreadcrumbs;