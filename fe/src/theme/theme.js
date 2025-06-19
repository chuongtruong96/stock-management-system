import { createTheme, alpha } from "@mui/material/styles";

/**
 * Enhanced theme configuration for the Stationery Management System
 * Provides consistent design tokens, improved accessibility, and modern styling
 */

// Design tokens
const designTokens = {
  colors: {
    primary: {
      50: "#E8F5E8",
      100: "#C8E6C9",
      200: "#A5D6A7",
      300: "#81C784",
      400: "#66BB6A",
      500: "#4CAF50", // Main
      600: "#43A047",
      700: "#388E3C",
      800: "#2E7D32",
      900: "#1B5E20",
    },
    secondary: {
      50: "#E3F2FD",
      100: "#BBDEFB",
      200: "#90CAF9",
      300: "#64B5F6",
      400: "#42A5F5",
      500: "#2196F3", // Main
      600: "#1E88E5",
      700: "#1976D2",
      800: "#1565C0",
      900: "#0D47A1",
    },
    neutral: {
      50: "#FAFAFA",
      100: "#F5F5F5",
      200: "#EEEEEE",
      300: "#E0E0E0",
      400: "#BDBDBD",
      500: "#9E9E9E",
      600: "#757575",
      700: "#616161",
      800: "#424242",
      900: "#212121",
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  shadows: {
    subtle: "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)",
    moderate: "0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)",
    strong: "0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)",
    intense: "0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)",
  },
};

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: designTokens.colors.primary[500],
      light: designTokens.colors.primary[300],
      dark: designTokens.colors.primary[800],
      contrastText: "#ffffff",
      50: designTokens.colors.primary[50],
      100: designTokens.colors.primary[100],
      200: designTokens.colors.primary[200],
      300: designTokens.colors.primary[300],
      400: designTokens.colors.primary[400],
      500: designTokens.colors.primary[500],
      600: designTokens.colors.primary[600],
      700: designTokens.colors.primary[700],
      800: designTokens.colors.primary[800],
      900: designTokens.colors.primary[900],
    },
    secondary: {
      main: designTokens.colors.secondary[500],
      light: designTokens.colors.secondary[300],
      dark: designTokens.colors.secondary[800],
      contrastText: "#ffffff",
      50: designTokens.colors.secondary[50],
      100: designTokens.colors.secondary[100],
      200: designTokens.colors.secondary[200],
      300: designTokens.colors.secondary[300],
      400: designTokens.colors.secondary[400],
      500: designTokens.colors.secondary[500],
      600: designTokens.colors.secondary[600],
      700: designTokens.colors.secondary[700],
      800: designTokens.colors.secondary[800],
      900: designTokens.colors.secondary[900],
    },
    success: {
      main: "#10B981",
      light: "#34D399",
      dark: "#059669",
      contrastText: "#ffffff",
    },
    warning: {
      main: "#F59E0B",
      light: "#FCD34D",
      dark: "#D97706",
      contrastText: "#ffffff",
    },
    error: {
      main: "#EF4444",
      light: "#F87171",
      dark: "#DC2626",
      contrastText: "#ffffff",
    },
    info: {
      main: "#3B82F6",
      light: "#60A5FA",
      dark: "#2563EB",
      contrastText: "#ffffff",
    },
    background: {
      default: "#FAFBFC",
      paper: "#FFFFFF",
      neutral: designTokens.colors.neutral[50],
    },
    text: {
      primary: designTokens.colors.neutral[900],
      secondary: designTokens.colors.neutral[600],
      disabled: designTokens.colors.neutral[400],
    },
    divider: designTokens.colors.neutral[200],
    action: {
      hover: alpha(designTokens.colors.primary[500], 0.04),
      selected: alpha(designTokens.colors.primary[500], 0.08),
      disabled: designTokens.colors.neutral[300],
      disabledBackground: designTokens.colors.neutral[100],
    },
    // Custom colors
    gradient: {
      primary: `linear-gradient(135deg, ${designTokens.colors.primary[500]} 0%, ${designTokens.colors.primary[600]} 100%)`,
      secondary: `linear-gradient(135deg, ${designTokens.colors.secondary[500]} 0%, ${designTokens.colors.secondary[600]} 100%)`,
      success: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
      warning: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
      error: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
    },
  },
  
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    h1: {
      fontWeight: 800,
      fontSize: "clamp(2rem, 5vw, 3.5rem)",
      lineHeight: 1.1,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontWeight: 700,
      fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
      lineHeight: 1.2,
      letterSpacing: "-0.01em",
    },
    h3: {
      fontWeight: 600,
      fontSize: "clamp(1.5rem, 3vw, 2rem)",
      lineHeight: 1.3,
      letterSpacing: "-0.01em",
    },
    h4: {
      fontWeight: 600,
      fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)",
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: "clamp(1.125rem, 2vw, 1.5rem)",
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      fontSize: "clamp(1rem, 1.5vw, 1.25rem)",
      lineHeight: 1.4,
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: "1.125rem",
      lineHeight: 1.5,
      letterSpacing: "0.01em",
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: "1rem",
      lineHeight: 1.5,
      letterSpacing: "0.01em",
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.6,
      letterSpacing: "0.01em",
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.6,
      letterSpacing: "0.01em",
    },
    button: {
      fontWeight: 600,
      textTransform: "none",
      fontSize: "0.875rem",
      letterSpacing: "0.02em",
    },
    caption: {
      fontSize: "0.75rem",
      lineHeight: 1.4,
      letterSpacing: "0.03em",
    },
    overline: {
      fontSize: "0.75rem",
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
    },
  },
  
  shape: {
    borderRadius: designTokens.borderRadius.md,
  },
  
  spacing: designTokens.spacing.sm,
  
  shadows: [
    "none",
    designTokens.shadows.subtle,
    "0px 2px 8px rgba(0,0,0,0.08)",
    designTokens.shadows.moderate,
    "0px 4px 16px rgba(0,0,0,0.12)",
    "0px 6px 20px rgba(0,0,0,0.14)",
    designTokens.shadows.strong,
    "0px 8px 28px rgba(0,0,0,0.18)",
    designTokens.shadows.intense,
    "0px 12px 36px rgba(0,0,0,0.22)",
    "0px 16px 44px rgba(0,0,0,0.24)",
    "0px 20px 52px rgba(0,0,0,0.26)",
    "0px 24px 60px rgba(0,0,0,0.28)",
    "0px 28px 68px rgba(0,0,0,0.30)",
    "0px 32px 76px rgba(0,0,0,0.32)",
    "0px 36px 84px rgba(0,0,0,0.34)",
    "0px 40px 92px rgba(0,0,0,0.36)",
    "0px 44px 100px rgba(0,0,0,0.38)",
    "0px 48px 108px rgba(0,0,0,0.40)",
    "0px 52px 116px rgba(0,0,0,0.42)",
    "0px 56px 124px rgba(0,0,0,0.44)",
    "0px 60px 132px rgba(0,0,0,0.46)",
    "0px 64px 140px rgba(0,0,0,0.48)",
    "0px 68px 148px rgba(0,0,0,0.50)",
  ],
  
  // Custom breakpoints for better responsive design
  breakpoints: {
    values: {
      xs: 0,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
  },
  
  // Z-index scale
  zIndex: {
    mobileStepper: 1000,
    fab: 1050,
    speedDial: 1050,
    appBar: 1100,
    drawer: 1200,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500,
  },
  
  components: {
    // Global component defaults
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: "thin",
          scrollbarColor: `${designTokens.colors.neutral[300]} ${designTokens.colors.neutral[100]}`,
          "&::-webkit-scrollbar": {
            width: 8,
          },
          "&::-webkit-scrollbar-track": {
            background: designTokens.colors.neutral[100],
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: designTokens.colors.neutral[300],
            borderRadius: 4,
            "&:hover": {
              backgroundColor: designTokens.colors.neutral[400],
            },
          },
        },
      },
    },

    // Card Components
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: designTokens.borderRadius.lg,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          border: `1px solid ${designTokens.colors.neutral[200]}`,
          backdropFilter: "blur(10px)",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: designTokens.shadows.strong,
            borderColor: alpha(theme.palette.primary.main, 0.2),
          },
        }),
      },
    },
    
    MuiCardActionArea: {
      styleOverrides: {
        root: {
          height: "100%",
          borderRadius: designTokens.borderRadius.lg,
          transition: "all 0.2s ease-in-out",
        },
      },
    },
    
    // Button Components
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: designTokens.borderRadius.md,
          padding: "12px 24px",
          fontWeight: 600,
          textTransform: "none",
          boxShadow: "none",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: designTokens.shadows.moderate,
          },
          "&:active": {
            transform: "translateY(0)",
          },
        }),
        contained: ({ theme }) => ({
          background: theme.palette.gradient?.primary || theme.palette.primary.main,
          "&:hover": {
            background: theme.palette.gradient?.primary || theme.palette.primary.dark,
            boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
          },
        }),
        outlined: ({ theme }) => ({
          borderWidth: 2,
          "&:hover": {
            borderWidth: 2,
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
          },
        }),
        text: ({ theme }) => ({
          "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
          },
        }),
      },
    },
    
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.borderRadius.sm,
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "scale(1.05)",
            backgroundColor: alpha(designTokens.colors.primary[500], 0.08),
          },
        },
      },
    },
    
    // Input Components
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }) => ({
          "& .MuiOutlinedInput-root": {
            borderRadius: designTokens.borderRadius.md,
            transition: "all 0.2s ease-in-out",
            backgroundColor: alpha(theme.palette.background.paper, 0.8),
            "&:hover": {
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.primary.main,
                borderWidth: 2,
              },
            },
            "&.Mui-focused": {
              backgroundColor: theme.palette.background.paper,
              "& .MuiOutlinedInput-notchedOutline": {
                borderWidth: 2,
                borderColor: theme.palette.primary.main,
                boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
              },
            },
          },
        }),
      },
    },
    
    // Chip Component
    MuiChip: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: designTokens.borderRadius.sm,
          fontWeight: 500,
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            transform: "scale(1.02)",
          },
        }),
        filled: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
          color: theme.palette.primary.main,
          "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.15),
          },
        }),
      },
    },
    
    // Paper Component
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.borderRadius.lg,
          backdropFilter: "blur(10px)",
        },
        elevation1: {
          boxShadow: designTokens.shadows.subtle,
        },
        elevation2: {
          boxShadow: designTokens.shadows.moderate,
        },
        elevation3: {
          boxShadow: designTokens.shadows.strong,
        },
        elevation4: {
          boxShadow: designTokens.shadows.intense,
        },
      },
    },
    
    // AppBar Component
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          boxShadow: designTokens.shadows.subtle,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          backdropFilter: "blur(20px)",
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
        }),
      },
    },
    
    // Menu Component
    MuiMenu: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: designTokens.borderRadius.md,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: designTokens.shadows.strong,
          backdropFilter: "blur(20px)",
          backgroundColor: alpha(theme.palette.background.paper, 0.95),
        }),
      },
    },
    
    // Dialog Component
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: designTokens.borderRadius.xl,
          backdropFilter: "blur(20px)",
        },
      },
    },
    
    // Badge Component
    MuiBadge: {
      styleOverrides: {
        badge: {
          fontWeight: 600,
          fontSize: "0.75rem",
          borderRadius: designTokens.borderRadius.xs,
        },
      },
    },
    
    // List Components
    MuiListItem: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: designTokens.borderRadius.sm,
          margin: "2px 0",
          transition: "all 0.2s ease-in-out",
          "&.Mui-selected": {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.12),
            },
          },
          "&:hover": {
            backgroundColor: alpha(theme.palette.action.hover, 0.5),
          },
        }),
      },
    },
    
    // Table Components
    MuiTableCell: {
      styleOverrides: {
        head: ({ theme }) => ({
          fontWeight: 600,
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
          borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }),
        root: {
          borderBottom: `1px solid ${alpha(designTokens.colors.neutral[200], 0.5)}`,
        },
      },
    },
    
    // Loading Components
    MuiSkeleton: {
      styleOverrides: {
        root: {
          borderRadius: designTokens.borderRadius.sm,
        },
      },
    },
    
    // Tooltip Component
    MuiTooltip: {
      styleOverrides: {
        tooltip: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.grey[900], 0.9),
          backdropFilter: "blur(10px)",
          borderRadius: designTokens.borderRadius.sm,
          fontSize: "0.75rem",
          fontWeight: 500,
        }),
      },
    },
    
    // Drawer Component
    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: `0 ${designTokens.borderRadius.lg}px ${designTokens.borderRadius.lg}px 0`,
          backdropFilter: "blur(20px)",
          backgroundColor: alpha(theme.palette.background.paper, 0.95),
        }),
      },
    },
  },
});

export default theme;