import PropTypes from "prop-types";

// @mui material components
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";

// Material Dashboard 2 React components
import MDBox from "components/template/MDBox";

// Custom styles for the SidenavCollapse
import {
  collapseItem,
  collapseIconBox,
  collapseIcon,
  collapseText,
} from "examples/Sidenav/styles/sidenavCollapse";

// Material Dashboard 2 React context
import { useMaterialUIController } from "context";

function SidenavCollapse({ icon, name, active, ...rest }) {
  const [controller] = useMaterialUIController();
  const {
    miniSidenav,
    transparentSidenav,
    whiteSidenav,
    darkMode,
    sidenavColor,
  } = controller;

  const content = (
    <ListItem component="li">
      <MDBox
        {...rest}
        sx={(theme) =>
          collapseItem(theme, {
            active,
            transparentSidenav,
            whiteSidenav,
            darkMode,
            sidenavColor,
          })
        }
      >
        <ListItemIcon
          sx={(theme) =>
            collapseIconBox(theme, {
              transparentSidenav,
              whiteSidenav,
              darkMode,
              active,
            })
          }
        >
          {typeof icon === "string" ? (
            <Icon sx={(theme) => collapseIcon(theme, { 
              active, 
              transparentSidenav, 
              whiteSidenav, 
              darkMode 
            })}>
              {icon}
            </Icon>
          ) : (
            icon
          )}
        </ListItemIcon>

        <ListItemText
          primary={name}
          sx={(theme) => ({
            ...collapseText(theme, {
              miniSidenav,
              transparentSidenav,
              whiteSidenav,
              active,
            }),
            "& .MuiListItemText-primary": {
              color: (() => {
                // Active items always use white text for better contrast
                if (active) return theme.palette.white.main;
                
                // White sidenav in light mode uses dark text
                if (whiteSidenav && !darkMode) return theme.palette.dark.main;
                
                // Transparent sidenav uses dark text in light mode, white in dark mode
                if (transparentSidenav) return darkMode ? theme.palette.white.main : theme.palette.dark.main;
                
                // Default: white text for better contrast
                return theme.palette.white.main;
              })(),
              fontWeight: active ? 600 : 500,
              fontSize: "0.875rem",
            }
          })}
        />
      </MDBox>
    </ListItem>
  );

  // Wrap with tooltip when sidebar is collapsed
  if (miniSidenav) {
    return (
      <Tooltip title={name} placement="right" arrow>
        {content}
      </Tooltip>
    );
  }

  return content;
}

// Setting default values for the props of SidenavCollapse
SidenavCollapse.defaultProps = {
  active: false,
};

// Typechecking props for the SidenavCollapse
SidenavCollapse.propTypes = {
  icon: PropTypes.node.isRequired,
  name: PropTypes.string.isRequired,
  active: PropTypes.bool,
};

export default SidenavCollapse;
