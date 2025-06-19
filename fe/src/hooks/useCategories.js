// src/hooks/useCategories.js
import { useQuery } from "@tanstack/react-query";
import { qk } from "../api/queries";
import { categoryApi } from "../services/api";

export const useCategories = () =>
  useQuery({ queryKey: qk.categories, queryFn: categoryApi.all });
