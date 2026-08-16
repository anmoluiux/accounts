/**
 * Which routes live inside the signup funnel.
 *
 * /onboard and /login share one layout instance so the showcase panel survives
 * navigation between them (see `app/(shell)/layout.tsx`). The trade is that the
 * shell can no longer be configured per route from above — so the couple of
 * components whose behaviour genuinely differs ask the router instead. This is
 * the one place that answer is defined, rather than three scattered
 * `startsWith("/onboard")` checks that could drift apart.
 *
 * `trailingSlash: true` in next.config means the pathname is "/onboard/", hence
 * the prefix test rather than an equality check.
 */
export const IN_FUNNEL = (pathname: string | null) => Boolean(pathname?.startsWith("/onboard"));
