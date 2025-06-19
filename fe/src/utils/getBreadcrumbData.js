import routes from "routes";
import { matchRoutes } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Hook for use in React components
export function useBreadcrumbData(pathname) {
  const { t } = useTranslation();
  const matches = matchRoutes(routes, pathname) || [];

  const crumbs = matches
    .map(({ route }) => route?.meta && ({
      title: t(route.meta.titleKey),
      icon: route.meta.icon,
    }))
    .filter(Boolean);

  const last = crumbs[crumbs.length - 1] || { title: "", icon: "" };
  return {
    title: last.title,
    icon: last.icon,
    route: crumbs.slice(0, -1), // for breadcrumb trail
  };
}
