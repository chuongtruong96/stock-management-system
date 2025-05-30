// utils/auth.js
export const normaliseRoles = (input = []) =>
  input
    .map((raw) => {
      if (typeof raw === "string")       return raw;
      if (raw?.authority)                return raw.authority;
      if (raw?.name)                     return raw.name;
      return "";
    })
    .filter(Boolean)                     // drop empty results
    .map((r) =>
      r.toUpperCase().replace(/^ROLE_/, "")   // strip prefix + unify case
    );
