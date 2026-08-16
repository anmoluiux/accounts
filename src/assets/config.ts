// Third-party tracking scripts: Mixpanel, Microsoft Clarity, Google Analytics,
// ContentSquare and the Tawk.to widget.
// Enabled by default — set NEXT_PUBLIC_ANALYTICS_ENABLED=false to turn them all off
// (e.g. in local .env, so dev traffic never reaches these vendors).
// Read at build time: this is a static export, so the value is baked into `out/`.
export const ANALYTICS_ENABLED = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== "false";
