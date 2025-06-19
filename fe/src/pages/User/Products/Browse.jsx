import { useEffect, useState, useContext } from "react";
import { Grid, TextField, Icon } from "@mui/material";
import { Link } from "react-router-dom";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import CategoryBar from "components/shop/CategoryBar";
import ProductCard from "components/shop/ProductCard";
import { CartContext } from "context/CartContext";
import {
  getCategories,
  getProductsByCat,
  getProducts,
  unwrap,
} from "services/api";

export default function Browse({ language = "en" }) {
  const [cats, setCats] = useState([]);
  const [cid, setCid] = useState(null);
  const [list, setList] = useState([]);
  const [search, setSearch] = useState("");

  const { cartItems, addToCart } = useContext(CartContext);

  useEffect(() => {
    getCategories().then((r) => setCats(unwrap(r)));
  }, []);

  useEffect(() => {
    const fn = cid ? getProductsByCat(cid) : getProducts();
    fn.then((r) => setList(unwrap(r)));
  }, [cid]);

  const filtered = list.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <CategoryBar list={cats} active={cid} onSelect={setCid} />

        <MDBox display="flex" my={2} alignItems="center" gap={2}>
          <TextField
            size="small"
            label={language === "vi" ? "Tìm" : "Search"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 250 }}
          />
          <Link
            to="/order-form"
            style={{ textDecoration: "none", marginLeft: "auto" }}
          >
            <MDBox
              display="flex"
              alignItems="center"
              color="white"
              bgColor="info"
              borderRadius="lg"
              px={2}
              py={1}
            >
              <Icon fontSize="small">shopping_bag</Icon>&nbsp;
              <MDTypography variant="button" color="white">
                {language === "vi" ? "Đặt hàng" : "Proceed"} ({cartItems.length}
                )
              </MDTypography>
            </MDBox>
          </Link>
        </MDBox>

        <Grid container spacing={2}>
          {filtered.map((p) => (
            <Grid key={p.id} item xs={6} sm={4} md={3} lg={2.4}>
              <ProductCard product={p} onAdd={addToCart} />
            </Grid>
          ))}
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}
