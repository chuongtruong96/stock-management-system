import { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Avatar, Box, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import LanguageIcon from '@mui/icons-material/Language';
import LogoutIcon from '@mui/icons-material/Logout';

const Navbar = ({ userRole, language, setLanguage, handleLogout, toggleSidebar, username }) => {
  const [languageAnchorEl, setLanguageAnchorEl] = useState(null);
  const navigate = useNavigate();

  // Handle language menu
  const handleLanguageMenu = (event) => {
    setLanguageAnchorEl(event.currentTarget);
  };

  const handleLanguageClose = (lang) => {
    if (lang) setLanguage(lang);
    setLanguageAnchorEl(null);
  };

  // Get user initials for the avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    const nameParts = name.split(' ');
    return nameParts.length > 1
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
      : name[0];
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Left Side: Menu Toggle and App Title */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleSidebar}
            sx={{ mr: 2 }}
            aria-label="toggle sidebar"
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              letterSpacing: 1,
            }}
          >
            {language === 'vi' ? 'Quản Lý Văn Phòng Phẩm' : 'Stationery Management'}
          </Typography>
        </Box>

        {/* Right Side: User Settings */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Language Toggle */}
          <Tooltip title={language === 'vi' ? 'Chọn Ngôn Ngữ' : 'Select Language'}>
            <IconButton
              color="inherit"
              onClick={handleLanguageMenu}
              aria-label="language menu"
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              <LanguageIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={languageAnchorEl}
            open={Boolean(languageAnchorEl)}
            onClose={() => handleLanguageClose(null)}
            PaperProps={{
              sx: {
                mt: 1,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            <MenuItem onClick={() => handleLanguageClose('en')}>English</MenuItem>
            <MenuItem onClick={() => handleLanguageClose('vi')}>Vietnamese</MenuItem>
          </Menu>

          {/* User Profile */}
          <Tooltip title={username || 'User'}>
            <Avatar
              sx={{
                bgcolor: '#42a5f5',
                width: 36,
                height: 36,
                cursor: 'pointer',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                },
              }}
              onClick={() => navigate('/profile')}
            >
              {getInitials(username)}
            </Avatar>
          </Tooltip>

          {/* Logout Button */}
          <Tooltip title={language === 'vi' ? 'Đăng Xuất' : 'Logout'}>
            <IconButton
              color="inherit"
              onClick={handleLogout}
              aria-label="logout"
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
