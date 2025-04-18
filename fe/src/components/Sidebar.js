import { useState, useEffect } from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Box, Typography, Collapse } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import HistoryIcon from '@mui/icons-material/History';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

const Sidebar = ({ open, toggleSidebar, userRole, language }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openSubMenu, setOpenSubMenu] = useState({}); // For collapsible sub-menus

  // Define navigation links based on user role
  const adminLinks = [
    { label: language === 'vi' ? 'Trang Chủ' : 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    {
      label: language === 'vi' ? 'Quản Lý Đơn Hàng' : 'Order Management',
      path: '/order-management',
      icon: <ShoppingCartIcon />,
    },
    {
      label: language === 'vi' ? 'Quản Lý Sản Phẩm' : 'Product Management',
      path: '/product-management',
      icon: <InventoryIcon />,
    },
   
    {
      label: language === 'vi' ? 'Quản Lý Đơn Vị' : 'Unit Management',
      path: '/unit-management',
      icon: <SettingsIcon />,
    },
    {
      label: language === 'vi' ? 'Quản Lý Người Dùng' : 'User Management',
      path: '/user-management',
      icon: <PeopleIcon />,
    },
    { label: language === 'vi' ? 'Nhập Đơn Hàng' : 'Import Orders', path: '/import-order', icon: <ShoppingCartIcon /> },
    { label: language === 'vi' ? 'Báo Cáo' : 'Reports', path: '/reports', icon: <AssessmentIcon /> },
  ];

  const userLinks = [
    { label: language === 'vi' ? 'Trang Chủ' : 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { label: language === 'vi' ? 'Danh Sách Sản Phẩm' : 'Products', path: '/products', icon: <InventoryIcon /> },
    { label: language === 'vi' ? 'Đặt Hàng' : 'Order Form', path: '/order-form', icon: <ShoppingCartIcon /> },
    { label: language === 'vi' ? 'Lịch Sử Đơn Hàng' : 'Order History', path: '/order-history', icon: <HistoryIcon /> },
  ];

  const links = userRole === 'admin' ? adminLinks : userLinks;

  // Handle sub-menu toggle (if you want to add sub-menus in the future)
  const handleSubMenuClick = (label) => {
    setOpenSubMenu((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <Drawer
      variant="permanent" // Persistent on desktop, can be toggled on mobile
      open={open}
      onClose={toggleSidebar}
      sx={{
        width: open ? 240 : 60,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: open ? 240 : 60,
          boxSizing: 'border-box',
          backgroundColor: '#f4f6f8',
          color: '#333',
          transition: 'width 0.3s ease',
          overflowX: 'hidden',
        },
      }}
    >
      {/* Sidebar Header */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: open ? 'space-between' : 'center', mt: 8 }}>
        {open && (
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            {language === 'vi' ? 'Menu' : 'Menu'}
          </Typography>
        )}
      </Box>

      <Divider />

      {/* Navigation Links */}
      <List>
        {links.map((link) => (
          <Box key={link.path}>
            <ListItem
              button
              onClick={() => {
                if (link.subLinks) {
                  handleSubMenuClick(link.label);
                } else {
                  navigate(link.path);
                }
              }}
              sx={{
                backgroundColor: location.pathname === link.path ? '#e0e0e0' : 'transparent',
                '&:hover': {
                  backgroundColor: '#e0e0e0',
                  transform: 'translateX(5px)',
                  transition: 'all 0.3s ease',
                },
                py: 1.5,
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: location.pathname === link.path ? '#1976d2' : '#666' }}>
                {link.icon}
              </ListItemIcon>
              {open && <ListItemText primary={link.label} />}
              {link.subLinks && (openSubMenu[link.label] ? <ExpandLess /> : <ExpandMore />)}
            </ListItem>
            {link.subLinks && (
              <Collapse in={openSubMenu[link.label]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {link.subLinks.map((subLink) => (
                    <ListItem
                      button
                      key={subLink.path}
                      sx={{
                        pl: 4,
                        backgroundColor: location.pathname === subLink.path ? '#e0e0e0' : 'transparent',
                        '&:hover': {
                          backgroundColor: '#e0e0e0',
                        },
                      }}
                      onClick={() => navigate(subLink.path)}
                    >
                      <ListItemText primary={subLink.label} />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </Box>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;