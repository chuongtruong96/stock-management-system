import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { adminRoutes } from "routes/adminRoutes";
import { userRoutes } from "routes/userRoutes";

/**
 * Flattens nested routes and assigns full paths
 */
function flattenRoutes(routes, parentPath = "") {
  return routes.flatMap((r) => {
    const fullPath = [parentPath, r.path].filter(Boolean).join("/");

    const base = {
      path: fullPath,
      titleKey: r.meta?.titleKey,
      icon: r.meta?.icon,
    };

    if (r.children) {
      return [base, ...flattenRoutes(r.children, fullPath)];
    }

    return [base];
  });
}

function matchRoute(pathname, allRoutes) {
  const segments = pathname.split("/").filter(Boolean);
  const routeStack = [];

  let pathAccumulator = "";

  for (let i = 0; i < segments.length; i++) {
    pathAccumulator += (i ? "/" : "") + segments[i];

    const match = allRoutes.find((r) =>
      r.path === pathAccumulator ||
      (r.path && r.path.includes(":") && matchDynamic(r.path, pathAccumulator))
    );

    if (match) {
      routeStack.push(match);
    } else {
      routeStack.push({
        path: pathAccumulator,
        titleKey: null,
        icon: "chevron_right",
      });
    }
  }

  return routeStack;
}

function matchDynamic(template, actual) {
  const regex = new RegExp(
    "^" +
      template
        .split("/")
        .map((part) => (part.startsWith(":") ? "[^/]+" : part))
        .join("/") +
      "$"
  );
  return regex.test(actual);
}

function prettify(str) {
  return str
    .split("/")
    .pop()
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * 👇 Call this inside a layout component
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
  const last = matched[matched.length - 1];
  const title = last?.titleKey ? t(last.titleKey) : prettify(last.path);
  const icon = last?.icon || "chevron_right";

  return { title, route, icon };
}
