/**
 * Content for the showcase panel (left 60% of the onboarding shell).
 *
 * ⚠️ PLACEHOLDER COPY. Every quote, name, number and claim below is invented to
 * give the layout real shape. Swap them for genuine merchant quotes and real
 * metrics before this goes in front of traffic — testimonials attributed to
 * named people are a legal and trust problem if they are made up.
 *
 * Kept as plain data (no JSX) so the server component can import it and the
 * panel prerenders into the static export with zero client JS. Icons live in the
 * components as inline SVG for the same reason.
 */

/**
 * Testimonials for the footer marquee.
 *
 * ⚠️ `source` names a real review platform on the card. That is an assertion
 * that the quote was left there — only ship these once each one is a genuine
 * review you can point to, or drop `source` and let the quotes stand alone.
 */
export type ProofSource = "google" | "trustpilot" | "capterra";

export type Proof = {
  id: string;
  quote: string;
  name: string;
  role: string;
  /** Two-letter avatar fallback. */
  initials: string;
  /** Whole stars out of 5. */
  rating: number;
  source: ProofSource;
};

export const SOURCE_LABEL: Record<ProofSource, string> = {
  google: "Google",
  trustpilot: "Trustpilot",
  capterra: "Capterra",
};

/* Enough entries that the marquee's two halves comfortably exceed the panel
   width — a short list would show the seam. */
export const PROOF: readonly Proof[] = [
  {
    id: "mariam",
    quote: "I launched my second store in an afternoon. Scaling stopped being the scary part.",
    name: "Mariam A.",
    role: "Founder, Nura Home",
    initials: "MA",
    rating: 5,
    source: "trustpilot",
  },
  {
    id: "daniel",
    quote: "Payouts, inventory, three storefronts — I closed my spreadsheet for good in week one.",
    name: "Daniel K.",
    role: "Owner, Kindling Goods",
    initials: "DK",
    rating: 5,
    source: "google",
  },
  {
    id: "priya",
    quote: "We moved off our old platform on a Sunday and took orders on Monday morning.",
    name: "Priya R.",
    role: "Director, Saffron & Salt",
    initials: "PR",
    rating: 5,
    source: "capterra",
  },
  {
    id: "tomas",
    quote: "The checkout just worked. First sale came in before I'd finished the about page.",
    name: "Tomás L.",
    role: "Founder, Cero Studio",
    initials: "TL",
    rating: 5,
    source: "google",
  },
  {
    id: "aisha",
    quote: "Support answered on a Sunday. That alone was worth switching for.",
    name: "Aisha M.",
    role: "Owner, Petal & Pine",
    initials: "AM",
    rating: 5,
    source: "trustpilot",
  },
  {
    id: "ben",
    quote: "I'd budgeted a month and a developer. It took an afternoon and neither.",
    name: "Ben O.",
    role: "Director, Northwall Supply",
    initials: "BO",
    rating: 4,
    source: "capterra",
  },
];

/**
 * Store themes shown in the centre of the panel at step 0.
 *
 * ⚠️ These render as CSS-drawn mockups, not real screenshots — deliberately, so
 * nothing on the page pretends to be a storefront that does not exist. Drop a
 * real preview image path into `preview` and the card renders that instead; the
 * Journal3 theme presets are the obvious source.
 */
export type Theme = {
  id: string;
  name: string;
  tag: string;
  /** Mockup palette. Ignored when `preview` is set. */
  bg: string;
  accent: string;
  ink: string;
  /** Optional real screenshot, e.g. "/themes/aurora.jpg" from `public/`. */
  preview?: string;
};

export const THEMES: readonly Theme[] = [
  { id: "aurora", name: "Aurora", tag: "Fashion", bg: "#f4efe8", accent: "#c9856a", ink: "#2a2320" },
  { id: "mono", name: "Mono", tag: "Minimal", bg: "#151515", accent: "#e8e6e1", ink: "#f5f5f3" },
  { id: "bazaar", name: "Bazaar", tag: "Grocery", bg: "#eef3ea", accent: "#4c8b4a", ink: "#1f2a1d" },
  { id: "atelier", name: "Atelier", tag: "Home", bg: "#f2eef7", accent: "#6e5ba6", ink: "#241f30" },
  { id: "forge", name: "Forge", tag: "Electronics", bg: "#101720", accent: "#3c8bd9", ink: "#eaf1f8" },
  { id: "harvest", name: "Harvest", tag: "Food", bg: "#fbf3e4", accent: "#c8802a", ink: "#2e2416" },
];

/*
 * The stats strip ("12,400+ stores launched" …) and the trust row ("No credit
 * card to start" …) lived here until the panel was cut down to header / themes
 * / testimonials. Both were invented figures; if you want them back, the trust
 * line earns more sitting under the Continue button in the form column than as
 * a fifth block down the left side.
 */

/**
 * Scene 1 (step "Tell us about you") — what the customer actually receives.
 * Real product claims, not placeholders: check them against what laracom's
 * CreateStoreJob provisions before editing.
 */
export type Included = {
  id: string;
  icon: "storefront" | "payments" | "shield" | "admin";
  title: string;
  line: string;
};

export const INCLUDED: readonly Included[] = [
  {
    id: "storefront",
    icon: "storefront",
    title: "Storefront & catalogue",
    line: "Products, categories, search and filters.",
  },
  {
    id: "payments",
    icon: "payments",
    title: "Checkout & payments",
    line: "Cards, UPI and wallets from day one.",
  },
  {
    id: "hosting",
    icon: "shield",
    title: "Hosting, SSL & backups",
    line: "Live on your address, secured and backed up.",
  },
  {
    id: "admin",
    icon: "admin",
    title: "Orders & admin",
    line: "One place for orders, stock and customers.",
  },
];

/**
 * Scene 2 (step "Go live") — the build, in the customer's language.
 *
 * `reachedAt` is a rank in BUILD_STATUS_RANK: a stage is in progress when the
 * live status ranks exactly there, and done once it ranks higher. Statuses come
 * from laracom's /customer/store/status and are polled by `userCredentials.tsx`,
 * which writes them into `users[customer_id].status` — this scene only reads.
 */
export const BUILD_STATUS_RANK: Record<string, number> = {
  PENDING: 0,
  BUILDING: 1,
  DB_CREATED: 2,
  DB_IMPORTING: 3,
  DB_PERSONALIZING: 4,
  COMPLETED: 5,
};

export const BUILD_STAGES = [
  { id: "reserve", label: "Reserving your address", reachedAt: 1 },
  { id: "database", label: "Creating your database", reachedAt: 2 },
  { id: "catalogue", label: "Importing your catalogue", reachedAt: 3 },
  { id: "personalise", label: "Personalising your store", reachedAt: 4 },
] as const;

/**
 * The funnel, as the customer sees it. Index matches `onboarding.currentStep`,
 * so adding a step here means adding one to the switch in
 * `app/(onboard)/onboard/page.tsx` too. Now consumed only for `STEP_COUNT`
 * (the form column's "Step 2 of 3"), since the panel's step rail was dropped
 * when the panel became header / themes / testimonials.
 */
export const FUNNEL_STEPS = [
  { id: "address", title: "Claim your address", caption: "The name customers will type." },
  { id: "details", title: "Tell us about you", caption: "So we can set the store up right." },
  { id: "launch", title: "Go live", caption: "We build it while you watch." },
] as const;

export const STEP_COUNT = FUNNEL_STEPS.length;
