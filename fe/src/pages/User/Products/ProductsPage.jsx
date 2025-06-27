// src/pages/User/Products/ProductsPage.jsx
import { useState } from "react";
import { Container, Alert, Box } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { categoryApi, productApi } from "services/api";
import { useCart } from "../../../context/CartContext/useCart";

import CategorySidebar from "components/categories/CategorySidebar";
import ToolbarFilter   from "components/shop/ToolbarFilter";
import ProductGrid     from "components/shop/ProductGrid";
import PaginationBar   from "components/shop/PaginationBar";
import "../../../css/pages/ProductsPage.css";

export default function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const pageParam = Number(params.get("page") ?? 0);
  const catParam  = params.getAll("categoryId").map(Number).filter(Boolean);
  const keyword   = params.get("q") ?? "";

  /* local UI state (view, size, sort) */
  const [view,     setView]     = useState(params.get("view")  ?? "grid");
  const [pageSize, setPageSize] = useState(Number(params.get("size") ?? 12));
  const [sort,     setSort]     = useState(params.get("sort")  ?? "default");

  const { addItem } = useCart();

  /* queries */
  const { data: cats = [] } = useQuery({
    queryKey: ["cats"],
    queryFn : categoryApi.all,
    staleTime: 60_000,
  });

  const {
    data: prodPage,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products", catParam, pageParam, pageSize, sort, keyword],
    queryFn : () =>
      productApi.listMultiCats(catParam, pageParam, pageSize, sort, keyword),
    keepPreviousData: true,
      });

  /* helpers for updating the URL params */
  const mutateParams = (fn) =>
    setParams((p) => {
      fn(p);
      return p;
    });

  const toggleCategory = (id) =>
    mutateParams((p) => {
      const exists = catParam.includes(id);
      p.delete("categoryId");
      (exists ? catParam.filter((c) => c !== id) : [...catParam, id])
        .forEach((c) => p.append("categoryId", c));
      p.set("page", 0);
    });

  const selectSingleCategory = (id) =>
    mutateParams((p) => {
      p.delete("categoryId");
      if (id !== null) p.append("categoryId", id);
      p.set("page", 0);
    });

  const changePage      = (v) => mutateParams((p) => p.set("page", v));
  const changeKeyword   = (kw)=> mutateParams((p) => { kw ? p.set("q", kw) : p.delete("q"); p.set("page", 0);});
  const changeSort      = (s) => mutateParams((p) => { s!=="default" ? p.set("sort", s):p.delete("sort");});
  const changePageSize  = (s) => mutateParams((p) => p.set("size", s));
  const changeView      = (v) => mutateParams((p) => { v!=="grid" ? p.set("view", v):p.delete("view");});

  if (error) return <Alert severity="error">{error.message}</Alert>;

  /* ============================== render ============================== */
  return (
    <Container
      maxWidth={false}          /* ❶ full-width, no 1280 px cap        */
      disableGutters
      sx={{ px: 0, mb: 6 }} 
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
        }}
      >
        {/* ---------- sidebar ---------- */}
        <Box sx={{ width: { xs: "100%", md: 240 }, flexShrink: 0 }}>
          <CategorySidebar
            list={cats}
            active={catParam}
            onSelect={selectSingleCategory}
          />
        </Box>

        {/* ---------- main ---------- */}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <ToolbarFilter
            keyword={keyword}
            setKeyword={changeKeyword}
            view={view}
            setView={(v) => { setView(v); changeView(v); }}
            pageSize={pageSize}
            setPageSize={(s) => { setPageSize(s); changePageSize(s); }}
            sort={sort}
            setSort={(s) => { setSort(s); changeSort(s); }}
            categories={cats}
            selectedCats={catParam}
            onToggleCat={toggleCategory}
            totalProducts={prodPage?.totalElements || prodPage?.content?.length || 0}
            currentPageProducts={prodPage?.content?.length || 0}
          />

          <ProductGrid
            products={prodPage?.content ?? []}
            loading={isLoading}
            view={view}
            onAddToCart={(p, q) => addItem(p, q)}
          />

          {prodPage && (
            <PaginationBar
              page={pageParam}
              totalPages={prodPage.totalPages}
              onPageChange={changePage}
              pageSize={pageSize}
              setPageSize={(s) => { setPageSize(s); changePageSize(s); }}
            />
          )}
        </Box>
      </Box>
    </Container>
  );
}
