// const LARAVEL_URL = "http://localhost/api/v1";
export const LARAVEL_URL    =  process.env.NEXT_PUBLIC_LARAVEL_URL || "https://laracom.brandwik.com/api/v1";
export const MAIN_SITE_URL  = process.env.NEXT_PUBLIC_MAIN_SITE_URL || "";

// The `bravo` marketing site, which owns /terms and /privacy. Linked from the
// onboarding footer; override per environment rather than hardcoding at the
// call site. Baked in at build time — this is a static export.
export const MARKETING_URL  = process.env.NEXT_PUBLIC_MARKETING_URL || "https://brandwik.com";


export const URL = {
    LARAVEL_URL,
    CHECK_EMAIL: `${LARAVEL_URL}/onboard/check-email`,
    CHECK_SUBDOMAIN: `${LARAVEL_URL}/onboard/check-subdomain`,
    ONBOARD_LEAD: `${LARAVEL_URL}/onboard/lead`,
    REGISTER: `${LARAVEL_URL}/onboard/register`,
    CREATE_STORE: `${LARAVEL_URL}/customer/store/create`,
    STORE_STATUS: `${LARAVEL_URL}/customer/store/status`,
}