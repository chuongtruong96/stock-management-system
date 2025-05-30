import { useState } from "react";
import { Container, Alert, Box } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { categoryApi, productApi } from "services/api";
import { useCart } from "context/CartContext";

import CategorySidebar from "components/categories/CategorySidebar";
import ToolbarFilter from "components/shop/ToolbarFilter";
import ProductGrid from "components/shop/ProductGrid";
import PaginationBar from "components/shop/PaginationBar";
import "../../../css/pages/ProductsPage.css"; // Assuming you have some styles for this page
export default function ProductsPage() {
  const [params, setParams] = useSearchParams();
  const pageParam = Number(params.get("page") ?? 0);
  const catParam = params.getAll("categoryId").map(Number).filter(Boolean);
  const keyword = params.get("q") ?? "";

  const [view, setView] = useState(params.get("view") ?? "grid");
  const [pageSize, setPageSize] = useState(Number(params.get("size") ?? 12));
  const [sort, setSort] = useState(params.get("sort") ?? "default");
  const { addItem } = useCart();

  const { data: cats = [] } = useQuery({ queryKey: ["cats"], queryFn: categoryApi.all, staleTime: 60_000 });
  const { data: prodPage, isLoading, error } = useQuery({
    queryKey: ["products", catParam, pageParam, pageSize, sort, keyword],
    queryFn: () => productApi.listMultiCats(catParam, pageParam, pageSize, sort, keyword),
    keepPreviousData: true,
  });

  const mutateParams = (fn) => setParams((p) => { fn(p); return p; });
  const toggleCategory = (id) => mutateParams((p) => {
    const exists = catParam.includes(id);
    p.delete("categoryId");
    const next = exists ? catParam.filter((c) => c !== id) : [...catParam, id];
    next.forEach((c) => p.append("categoryId", c));
    p.set("page", 0);
  });
  const selectSingleCategory = (id) => mutateParams((p) => { p.delete("categoryId"); if (id !== null) p.append("categoryId", id); p.set("page", 0); });
  const changePage = (v) => mutateParams((p) => p.set("page", v));
  const changeKeyword = (kw) => mutateParams((p) => { kw ? p.set("q", kw) : p.delete("q"); p.set("page", 0); });
  const changeSort = (s) => mutateParams((p) => { s !== "default" ? p.set("sort", s) : p.delete("sort"); });
  const changePageSize = (s) => mutateParams((p) => p.set("size", s));
  const changeView = (v) => mutateParams((p) => { v !== "grid" ? p.set("view", v) : p.delete("view"); });

  if (error) return <Alert severity="error">{error.message}</Alert>;

  return (
    <Container maxWidth="lg" sx={{ mb: 6 }}>
      <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
        <Box sx={{ width: 240, flexShrink: 0 }}>
          <CategorySidebar list={cats} active={catParam} onSelect={selectSingleCategory} />
        </Box>
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
          />

          <ProductGrid products={prodPage?.content ?? []} loading={isLoading} view={view} onAddToCart={(p, q) => addItem(p, q)} />

          {prodPage && <PaginationBar page={pageParam} totalPages={prodPage.totalPages} onPageChange={changePage} pageSize={pageSize} setPageSize={(s) => { setPageSize(s); changePageSize(s); }} />}
        </Box>
      </Box>
    </Container>
  );
}