import { useSearchParams } from "react-router-dom";
import { useCallback } from "react";

export default function useSearch(key = "q") {
  const [params, setParams] = useSearchParams();
  const value = params.get(key) ?? "";

  const setValue = useCallback(
    (v) => {
      setParams((p) => {
        if (v) {
          p.set(key, v);
        } else {
          p.delete(key);
        }
        p.set("page", 0);
        return p;
      });
    },
    [key, setParams]
  );

  return [value, setValue];
}