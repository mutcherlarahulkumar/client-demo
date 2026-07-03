import { useEffect } from "react";
import { useRouter } from "next/router";
import type { ComponentType } from "react";
import { useAuth } from "@artsdiva/hooks/useAuth";
import type { Role } from "@artsdiva/types/auth.types";

// Route guard HOC for Pages Router pages. Wrap a page's default export:
//   export default withAuth(SomePage);
//   export default withAuth(AdminOnlyPage, ["ADMIN"]);
export function withAuth<P extends object>(Component: ComponentType<P>, allowedRoles?: Role[]) {
  function Guarded(props: P) {
    const router = useRouter();
    const { user, isLoading } = useAuth();

    useEffect(() => {
      if (isLoading) return;

      if (!user) {
        // Remember where they were headed so login can send them back
        // instead of always landing on the dashboard.
        const next = router.asPath;
        void router.replace(next && next !== "/" ? `/login?next=${encodeURIComponent(next)}` : "/login");
        return;
      }

      if (allowedRoles && !allowedRoles.includes(user.role)) {
        void router.replace("/");
      }
    }, [isLoading, user, router]);

    const isAuthorized = user && (!allowedRoles || allowedRoles.includes(user.role));

    if (isLoading || !isAuthorized) return null;

    return <Component {...props} />;
  }

  Guarded.displayName = `withAuth(${Component.displayName ?? Component.name ?? "Component"})`;
  return Guarded;
}
