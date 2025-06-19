// components/SectionCard.js
import Card from "@mui/material/Card";
import MDBox from "components/template/MDBox";

export default function SectionCard({ title, button, children }) {
  return (
    <Card>
      <MDBox
        mx={2}
        mt={-3}
        py={2}
        px={2}
        variant="gradient"
        bgColor="info"
        borderRadius="lg"
        coloredShadow="info"
        display="flex"
        alignItems="center"
      >
        <MDBox component="h5" color="white">
          {title}
        </MDBox>
        {button && <MDBox ml="auto">{button}</MDBox>}
      </MDBox>
      <MDBox pt={3}>{children}</MDBox>
    </Card>
  );
}
