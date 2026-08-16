import SplitShell from "@/src/components/onboarding/shell/SplitShell";

/**
 * The 60 / 40 shell, shared by /onboard and /login.
 *
 * ONE layout for both routes, deliberately. They used to sit in sibling route
 * groups with a layout each — both rendering the same `SplitShell`, but Next.js
 * only preserves state for layouts that are *shared* in the route tree. Sibling
 * layouts are not shared, so navigating between signup and sign-in unmounted the
 * whole left panel and mounted a fresh copy: the testimonial marquee jumped back
 * to the start of its loop every time. Under this single layout the panel is
 * never unmounted, so the marquee keeps running straight through the navigation.
 *
 * The two routes differ only in what they render into `children`; the handful of
 * behavioural differences (no step counter on /login, panel not tracking the
 * funnel step off the funnel) are decided by the client leaves that already read
 * the route, not by duplicating the shell.
 *
 * A server component, so the panel and form chrome still prerender into the
 * static export.
 *
 * No `metadata` export here. Both child pages define their own title,
 * description, canonical and social card, so anything set at this level would
 * be dead config that never reaches the document — and a bare `title` string
 * here would read as if it did.
 */
export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return <SplitShell>{children}</SplitShell>;
}
