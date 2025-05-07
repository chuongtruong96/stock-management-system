/*  src/examples/Footer/index.js  (overwrite the old file)  */
import PropTypes from "prop-types";

// @mui material components
import Icon   from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox        from "components/MDBox";
import MDTypography from "components/MDTypography";

// template base typography‑sizes
import typography from "assets/theme/base/typography";

function Footer({ company }) {
  const { size } = typography;

  return (
    <MDBox
      width="100%"
      display="flex"
      flexDirection={{ xs: "column", md: "row" }}
      justifyContent="center"
      alignItems="center"
      py={2}
      px={1.5}
      sx={{ fontSize: size.sm, color: "text.main" }}
    >
      © {new Date().getFullYear()}, made with&nbsp;
      <MDBox color="text.main" fontSize={size.md} mb={-0.5}>
        <Icon fontSize="inherit">favorite</Icon>
      </MDBox>
      &nbsp;by&nbsp;
      <MDTypography variant="button" fontWeight="medium">
        {company.name}
      </MDTypography>
    </MDBox>
  );
}

/* -------- default props & type check -------- */
Footer.defaultProps = {
  company: { name: "Công ty TNHH Phát triển Phú Mỹ Hưng" },
};

Footer.propTypes = {
  company: PropTypes.shape({ name: PropTypes.string.isRequired }),
};

export default Footer;
