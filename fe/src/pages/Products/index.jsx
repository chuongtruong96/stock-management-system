import { useEffect, useState } from "react";
import { Grid, TextField } from "@mui/material";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import CategoryBar from "./CategoryBar";
import ProductCard from "./ProductCard";
import { getCategories, getProductsByCat, getProducts } from "services/api";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import Icon from "@mui/material/Icon";
import { unwrap } from "services/api";   // helper tách .content (đã hướng dẫn)
export default function Products({ language="en" }){
  const [cats, setCats] = useState([]);
  const [cid,  setCid ] = useState(null);      // category chọn
  const [list, setList] = useState([]);
  const [search,setSearch]=useState("");
  const [cart,setCart]=useState(JSON.parse(localStorage.getItem("orderItems")||"[]"));

  /* categories */
  /* categories */
  useEffect(()=>{
    getCategories().then(r=>setCats(unwrap(r)));
  },[]);

  /* products */
  useEffect(()=>{
    const fn = cid ? getProductsByCat(cid) : getProducts();
    fn.then(r=>setList(unwrap(r)));
  },[cid]);

  /** add-to-cart giống trước */
  const addToCart = p =>{
    setCart(prev=>{
      const exist = prev.find(i=>i.id===p.id);
      const next  = exist ? prev.map(i=>i.id===p.id?{...i,quantity:i.quantity1}:i)
                          : [...prev,{id:p.id,code:p.code,name:p.name,unit:p.unit,quantity:1}];
      localStorage.setItem("orderItems",JSON.stringify(next));
      toast.success(`${p.name} ${language==="vi"?"đã vào giỏ":"added"}`);
      return next;
    });
  };

  /* filter search ngay trên client */
  const show = list.filter(p=>p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <DashboardNavbar/>
      <MDBox pt={6} pb={3}>

        {/* BAR category */}
        <CategoryBar list={cats} active={cid} onSelect={setCid}/>

        {/* search  proceed */}
        <MDBox display="flex" my={2} alignItems="center" gap={2}>
          <TextField
            size="small" label={language==="vi"?"Tìm":"Search"}
            value={search} onChange={e=>setSearch(e.target.value)}
            sx={{ width:250 }}
          />
          <Link to="/order-form" style={{ textDecoration:"none", marginLeft:"auto" }}>
            <MDBox display="flex" alignItems="center" color="white" bgColor="info"
                   borderRadius="lg" px={2} py={1}>
              <Icon fontSize="small">shopping_bag</Icon>&nbsp;
              <MDTypography variant="button" color="white">
                {language==="vi"?"Đặt hàng":"Proceed"} ({cart.length})
              </MDTypography>
            </MDBox>
          </Link>
        </MDBox>

        {/* GRID product */}
        <Grid container spacing={2}>
          {show.map(p=>(
            <Grid key={p.id} item xs={6} sm={4} md={3} lg={2.4}>
              <ProductCard p={p} onAdd={addToCart} lang={language}/>
            </Grid>
          ))}
        </Grid>

      </MDBox>
      <Footer/>
    </DashboardLayout>
  );
}
