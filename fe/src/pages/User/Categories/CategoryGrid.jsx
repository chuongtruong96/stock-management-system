import React from "react";

import Skeleton from "@mui/material/Skeleton";
import Grid from "@mui/material/Grid";
import CategoryCard          from "../../../components/categories/CategoryCard";
import { useCategories }     from "hooks/useSharedData";



export default function CategoryGrid() {
  const { data:categories=[], isLoading:loading } = useCategories();

  if (loading)
    return (
      <Grid container spacing={2} p={3}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Grid key={i} item xs={6} sm={4} md={3} lg={2}>
            <Skeleton variant="rectangular" height={120} />
          </Grid>
        ))}
      </Grid>
    );

  return (
    <Grid container spacing={3} columns={15}>
  {categories.map(c => (
    <Grid key={c.id} item xs={3 /* 15 cols / 5 = 3 */}>
      <CategoryCard data={c} />
    </Grid>
  ))}
</Grid>
  );
}