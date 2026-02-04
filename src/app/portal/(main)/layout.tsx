/**
 * Portal main route group layout.
 *
 * This is now a passthrough - the UnifiedPortalShell in the parent layout
 * handles all sidebar/nav/shell logic for both login and dashboard views.
 *
 * The (main) route group exists to separate authenticated dashboard routes
 * from the (auth) route group which contains the login page.
 */
export default function PortalMainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
