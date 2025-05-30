// src/hooks/useCategories.js
import { useQuery } from "@tanstack/react-query";
import { qk } from "../api/queries";
import { getCategories } from "../services/api";

export const useCategories = () =>
  useQuery({ queryKey: qk.categories, queryFn: getCategories });
