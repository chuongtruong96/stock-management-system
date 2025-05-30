import { useQuery } from "@tanstack/react-query";
import { productApi } from "services/api";

export const useProducts = (catId=null, id=null, page=0) => {
  return useQuery({
    queryKey: id ? ["product", id] : ["products", catId, page],
    queryFn : id
      ? () => productApi.byId(id).then(productApi.normalize)
      : () => productApi.list(catId, page).then(arr => arr.map(productApi.normalize)),
  });
};