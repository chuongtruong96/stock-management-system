// src/layouts/user/sidebarConfig.js
import Dashboard    from "@mui/icons-material/Dashboard";
import Category     from "@mui/icons-material/Category";
import Inventory    from "@mui/icons-material/Inventory2";
import History      from "@mui/icons-material/History";
import Person       from "@mui/icons-material/Person";

export default [
  { title: "Home",    path: "/dashboard",     icon: <Dashboard /> },
  { title: "Products", path: "/products",      icon: <Inventory /> },
  { title: "Orders",  path: "/order-history", icon: <History /> },
  { title: "Profile", path: "/profile",       icon: <Person /> },
];
