import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { adminRoutes } from "routes/adminRoutes";
import { userRoutes } from "routes/userRoutes";

/**
 * Flatten routes into a lookup array
 */
function flattenRoutes(routes, parentPath = "") {
  return routes.flatMap((r) => {
    const fullPath = [parentPath, r.path].filter(Boolean).join("/");

    const base = {
      path: fullPath,
      titleKey: r.meta?.titleKey || null,
      icon: r.meta?.icon || "chevron_right",
    };

    if (r.children) {
      return [base, ...flattenRoutes(r.children, fullPath)];
    }

    return [base];
  });
}

/**
 * Dynamic route matcher, e.g., products/:id
 */
function matchDynamic(template, actual) {
  const templateParts = template.split("/");
  const actualParts = actual.split("/");

  if (templateParts.length !== actualParts.length) return false;

  return templateParts.every((seg, i) =>
    seg.startsWith(":") || seg === actualParts[i]
  );
}

/**
 * Match current path segments against known routes
 */
function matchRoute(pathname, allRoutes) {
  const segments = pathname.split("/").filter(Boolean);
  const routeStack = [];

  let builtPath = "";

  for (let i = 0; i < segments.length; i++) {
    builtPath += (i ? "/" : "") + segments[i];

    const match = allRoutes.find(
      (r) =>
        r.path === builtPath ||
        (r.path && r.path.includes(":") && matchDynamic(r.path, builtPath))
    );

    if (match) {
      routeStack.push(match);
    } else {
      routeStack.push({
        path: builtPath,
        titleKey: null,
        icon: "chevron_right",
      });
    }
  }

  return routeStack;
}

/**
 * Fallback: Convert 'order-history' → 'Order History'
 */
function prettify(str) {
  return str
    .split("/")
    .pop()
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * 🔧 Hook to inject translated breadcrumb data
 */
export function useBreadcrumbData() {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const allRoutes = [
    ...flattenRoutes(adminRoutes),
    ...flattenRoutes(userRoutes),
  ];

  const matched = matchRoute(pathname, allRoutes);

  const route = matched.map((r) => r.path);
const last = matched.length > 0 ? matched[matched.length - 1] : null;

const title = last?.titleKey ? t(last.titleKey) : prettify(last?.path || "");
const icon = last?.icon || "chevron_right";

  return { title, route, icon };
}
