# `accounts` — Project Overview

> In-depth technical overview of `saas-platform/accounts`, generated 2026-07-24 by reading the
> source tree at commit `1db0eee` (plus 5 uncommitted modified files).

---

## 1. What this project is

`accounts` is the **public-facing front door** of a multi-tenant SaaS store-builder. It does two
things:

1. Serves a **marketing landing page** (branded *"ShopWave"*) at `/`.
2. Runs a **self-serve onboarding funnel** at `/onboard/` that turns an anonymous visitor into a
   provisioned, subdomain-hosted e-commerce store — collecting a subdomain, brand details, and
   credentials, then polling a build pipeline until the store is live.

Critically, **this repo contains no backend of its own at runtime**. It is compiled to a pile of
static HTML/JS (`output: 'export'`) and every stateful operation is an HTTP call to an external
Laravel API at `https://laracom.brandwik.com/api/v1`. The Prisma/Postgres/Redis code in `src/` is
vestigial (see §7).

| | |
|---|---|
| **Repo** | `git@github.com:anmoluiux/accounts.git` (branch `master`) |
| **Framework** | Next.js 16.1.1 (App Router) on React 19.2.3 |
| **Language** | TypeScript 5 (`strict: true`, `noEmit`) |
| **UI** | Ant Design 6.1.4 + Tailwind CSS 4 + CSS Modules |
| **State** | Redux Toolkit 2.11 + redux-persist 6 (localStorage) |
| **Build target** | Static export → `out/` |
| **Backend** | External Laravel API (`laracom.brandwik.com`) — *not in this repo* |
| **Public domain** | `brandwik.com` + wildcard `*.brandwik.com` (tenant subdomains) |

---

## 2. Directory map

```
accounts/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout: fonts, providers, 5 analytics scripts
│   ├── page.tsx                      # 471-line "ShopWave" marketing landing page
│   ├── globals.css                   # Tailwind 4 entry + CSS custom properties
│   ├── LandingPage.module.css        # 360 lines of landing-page CSS Modules
│   └── (onboard)/onboard/page.tsx    # Onboarding funnel switchboard
│
├── src/
│   ├── store/
│   │   ├── store.ts                  # configureStore + redux-persist wiring
│   │   ├── onboardingSlice.ts        # The single slice: all funnel state + saveProgress thunk
│   │   └── ReduxProvider.tsx         # Client provider: Provider → PersistGate → ConfigProvider
│   ├── components/
│   │   ├── onboarding/               # 6 step components (only 3 are wired — see §4)
│   │   │   ├── Step1_Prompt.tsx      # ACTIVE  — step 0
│   │   │   ├── Details.tsx           # ACTIVE  — step 1
│   │   │   ├── userCredentials.tsx   # ACTIVE  — step 2
│   │   │   ├── Step2_Vibe.tsx        # dormant
│   │   │   ├── Building.tsx          # dormant
│   │   │   └── Step5_Reveal.tsx      # dormant
│   │   ├── analytics/mixpanel.tsx    # Mixpanel init-on-mount
│   │   └── ui/AnimatedCard.tsx       # EMPTY FILE (0 bytes)
│   ├── lib/
│   │   ├── hooks.ts                  # Typed useAppDispatch / useAppSelector / useAppStore
│   │   └── redis.ts                  # ioredis singleton — UNUSED (see §7)
│   ├── prisma/prisma.ts              # PrismaClient singleton — UNUSED (see §7)
│   └── assets/url.tsx                # Central API endpoint registry
│
├── prisma/
│   ├── schema.prisma                 # Lead / User / Site models
│   └── migrations/20260106194448_init/migration.sql
│
├── out/                              # Committed-to-disk static export artifact
├── Dockerfile                        # Multi-stage build (targets `standalone` — see §8)
├── docker-compose.yml                # app + postgres:15 + adminer
├── next.config.ts                    # output: 'export', trailingSlash, unoptimized images
├── prisma.config.ts                  # Prisma 7 config, reads DATABASE_URL via dotenv
└── .env                              # 4 vars (gitignored)
```

**Path alias:** `@/*` → `./*` (repo root), so imports read as `@/src/store/...`.

---

## 3. Runtime architecture

```
Browser
  │
  ├─ /                     app/page.tsx           (static, client component)
  └─ /onboard/             app/(onboard)/onboard/page.tsx
        │
        │  reads state.onboarding.currentStep
        ├─ 0 → Step1_Prompt      ──┐
        ├─ 1 → Details           ──┤ dispatch → Redux (persisted to localStorage)
        └─ 2 → userCredentials   ──┘        │
                                            │ fetch()
                                            ▼
                         https://laracom.brandwik.com/api/v1   (Laravel)
                                            │
                                            ▼
                         provisions  <sub>.brandwik.com  +  /admin panel
```

### Provider stack (`app/layout.tsx`)

```
<html><body class="geist-sans geist-mono antialiased">
  <AntdRegistry>          ← SSR-safe CSS-in-JS extraction for Ant Design
    <ReduxProvider>       ← Provider → PersistGate → antd ConfigProvider
      {children}
    </ReduxProvider>
  </AntdRegistry>
  <AnalyticsMixpanel/> + Clarity + Tawk.to + Contentsquare + GoogleAnalytics
</body></html>
```

`ReduxProvider` builds the store once via `useRef` (per-request-safe pattern) and sets the Ant Design
theme to `defaultAlgorithm` with `colorPrimary: "#000000"`.

### API surface (`src/assets/url.tsx`)

Base: `process.env.NEXT_PUBLIC_LARAVEL_URL` → fallback `https://laracom.brandwik.com/api/v1`

| Key | Endpoint | Method | Used by |
|---|---|---|---|
| `CHECK_SUBDOMAIN` | `/onboard/check-subdomain?subdomain=` | GET | Step1_Prompt (debounced 500 ms) |
| `CHECK_EMAIL` | `/onboard/check-email?email=` | GET | Details (debounced 500 ms) |
| `ONBOARD_LEAD` | `/onboard/lead` | POST (upsert) | `saveProgress` thunk |
| `REGISTER` | `/onboard/register` | POST | Details |
| `CREATE_STORE` | `/customer/store/create` | POST | Details |
| `STORE_STATUS` | `/customer/store/status?site_id=` | GET | userCredentials (poll, 4 s) |

All responses use a standardised envelope: `{ status, data, message }`. `saveProgress` treats
`status === 'error'` or a non-OK HTTP code as failure and throws `result.message`.

---

## 4. The onboarding funnel, step by step

The switchboard in [app/(onboard)/onboard/page.tsx](app/%28onboard%29/onboard/page.tsx#L34-L41) is a
plain conditional render over `currentStep`. The Ant Design `<Steps>` progress bar is **hard-disabled**
(`const showStepper = false;` at line 20), and a debug **"SetStep"** button that resets to step 0 is
rendered in the header.

### Step 0 — `Step1_Prompt.tsx` — "Let's name your dream store."

Collects **Brand Name**, **Store Address** (subdomain), **Business Type**
(`online_store | blog | portfolio | restaurant`).

- Subdomain input is sanitised on every keystroke: `toLowerCase().replace(/[^a-z0-9-]/g, "")`.
- Availability check fires only at ≥ 3 chars, debounced 500 ms via a `useRef(debounce(...)).current`
  so the debouncer survives re-renders; cancelled on unmount.
- A `StatusSuffix` sub-component renders spinner / green check / red X inline in the input.
- The submit button is gated on `subdomain && businessName && isAvailable === true`.
- On submit: `updateFormData({siteName, businessName, siteType})` → `saveProgress()` → `setStep(1)`.

> `siteName` doubles as the subdomain throughout the slice — there is no separate field.

### Step 1 — `Details.tsx` — "Almost there."

Collects **description**, **features**, **email**, **phone**, **password** in one Ant Design `Form`.

- `FEATURE_SUGGESTIONS` is a `Record<siteType, {label,value}[]>` map with entries for
  `fashion`, `restaurant`, `beauty`, `electronics`, and `default`. Note the keys **do not overlap**
  with the Step-0 select options (`online_store`, `blog`, `portfolio`, `restaurant`), so every path
  except *restaurant* falls through to `default`.
- Email availability is checked against `CHECK_EMAIL`, debounced 500 ms, reading `result.data.available`.
- `onFinish` runs a **three-call orchestration**:

  ```
  1. dispatch(updateFormData(...)) ; await saveProgress()      → POST /onboard/lead   (upsert, sets lead_id)
  2. POST /onboard/register  { lead_id, password }             → { data: { customer, site } }
       ├─ setBoardMerge  users.<customer_id> = data
       └─ setBoardState  customer_id = customer.id
  3. POST /customer/store/create  { site_id }                  → { status, message }
       └─ if status === "success"  →  setStep(2)
  ```

### Step 2 — `userCredentials.tsx` — build progress + credential reveal

*(The default export is confusingly named `Building`, colliding conceptually with the separate
`Building.tsx` file.)*

- Polls `STORE_STATUS` every **4 s**, merging the response into `users.<customer_id>.status`.
- `STATUS_MAP` translates backend states to progress percentages:
  `PENDING 5 → BUILDING 15 → DB_CREATED 20 → DB_IMPORTING 40 → DB_PERSONALIZING 90 → COMPLETED 100`
  (`FAILED` → 0).
- A second interval (every 2 s) animates the bar upward toward the current status target, **capped at
  95 %** until `COMPLETED` arrives — the classic "never finish early" progress UX.
- Polling stops on `COMPLETED` / `FAILED`.
- On `COMPLETED`, a `<Descriptions>` panel reveals: site name, type, store link
  (`<subdomain>.<MAIN_SITE_URL>`), admin login link (`.../admin`), and an admin-password row.
- A **"Create New"** button dispatches `resetStepData()` to wipe the lead and restart at step 0.

### Dormant components (present, not reachable)

| File | What it does | Why it's dormant |
|---|---|---|
| `Step2_Vibe.tsx` | 4-card design-vibe picker (`minimal / bold / luxury / playful`) writing `stepData.siteVibe` | Not rendered by the switchboard. Its `handleNext` dispatches `setStep(2)`, which would now land on `userCredentials`, not the intended details step. |
| `Building.tsx` | Standalone fake-progress + one-shot status fetch | Superseded by `userCredentials.tsx`. Still hardcodes `http://localhost/api/v1/...` instead of using `URL`. |
| `Step5_Reveal.tsx` | Faux-browser preview of the generated store + soft-gate registration modal | Referenced only in commented-out JSX. Reads `siteVibe`, which nothing currently sets. |
| `ui/AnimatedCard.tsx` | — | **0-byte file.** |

---

## 5. State management

### Shape (`src/store/onboardingSlice.ts`)

```ts
interface OnboardingState {
  currentStep: number;              // 0 | 1 | 2 drives the switchboard
  customer_id: string | null;       // set after /onboard/register
  lead_id:     string | null;       // set from saveProgress.fulfilled payload
  stepData: {
    siteName?, businessName?, siteType?,   // step 0  (siteName === subdomain)
    siteVibe?,                             // step "2_Vibe" — currently never written
    description?, features?: string[],     // step 1
    userId?, siteId?, email?, phone?
  };
  users: { [customer_id]: { customer, site, status } };   // server payload cache
  isLoading: boolean;
  error: string | null;
}
```

### Reducers

| Action | Purpose |
|---|---|
| `setStep(n)` | Move the funnel pointer |
| `setLeadId(id)` | Explicit lead id setter |
| `updateFormData(partial)` | Shallow-merge into `stepData` |
| `setBoardState({name, data})` | `lodash.set` — write any dot-path in state |
| `setBoardMerge({name, data})` | `lodash.get` + object-merge at any dot-path (falls back to overwrite for non-objects) |
| `resetOnboarding()` | Return `initialState` |
| `resetStepData()` | Clear `lead_id`, `customer_id`, `currentStep`, `stepData` — but **leaves `users` populated** |

`setBoardState` / `setBoardMerge` are a deliberate generic escape hatch: they let components write to
arbitrary nested paths (`users.${customer_id}.status`) without dedicated reducers. Powerful, but it
means the state shape is no longer enforced by the type system at the call site.

### Async

`saveProgress` is the sole `createAsyncThunk`. It reads `{lead_id, stepData}` from `getState()`,
POSTs `{id: lead_id, ...stepData}` to `ONBOARD_LEAD`, and on `fulfilled` copies
`action.payload.lead_id` back into state. `pending` / `rejected` maintain `isLoading` / `error`.
The file also carries a large commented-out block labelled **"FOR POSTGRES :: ABANDONED"** — the
original design that talked to local `/api/leads` routes before the Laravel backend took over.

### Persistence

`redux-persist` writes to **localStorage** under key `onboarding-storage`. The `whitelist` is
commented out, so the **entire** onboarding reducer is persisted — including the `users` map holding
server-returned customer and site records. `serializableCheck` is disabled in middleware (required by
redux-persist).

---

## 6. Data model (`prisma/schema.prisma`)

Three Postgres models, all UUID-keyed:

```
Lead  ── the anonymous draft, created before registration
  id, email?, phone?, siteName?, siteType?, details Json? = "{}"
  description?, features String[]
  isConverted Boolean = false, convertedUserId?, createdAt, updatedAt

User  ── created at registration
  id, email @unique, passwordHash, fullName?
  sites Site[], createdAt

Site  ── the provisioned tenant
  id, userId → User
  name, subdomain @unique, customDomain? @unique
  type, description?
  config Json = "{}"
  status String = "PENDING"      // PENDING | BUILDING | COMPLETED | FAILED
  createdAt, updatedAt
```

The `Lead → User + Site` shape mirrors the funnel exactly: a lead accumulates answers anonymously,
then `isConverted`/`convertedUserId` mark the hand-off.

**Schema drift — the migration and the schema disagree.** There is only one migration
(`20260106194448_init`, 2026-01-06), and it does not match the current `schema.prisma`:

| | Migration SQL | `schema.prisma` |
|---|---|---|
| `Lead.siteVibe` | present (`TEXT`) | **absent** (replaced by `details Json?`) |
| `Lead.details` | absent | present |
| `Site.name` / `.type` / `.description` / `.status` / `.updatedAt` | **absent** | present |
| `Site.config` default | none | `"{}"` |

Running `prisma migrate dev` against this schema would generate a second migration. Since the app no
longer uses Prisma at runtime (§7), this is latent rather than actively broken — but it means the
schema file is **not** a reliable description of any live database.

The generator declares `binaryTargets = ["native", "linux-musl-openssl-3.0.x"]` for the Alpine
container, and `datasource db` has no inline `url` — it is injected by `prisma.config.ts` from
`DATABASE_URL`.

---

## 7. The dead server layer

This is the single most important thing to understand about the codebase:

**`next.config.ts` sets `output: 'export'`.** That means:

- There is no Node server at runtime. No API routes, no Server Actions, no `getServerSideProps`.
- There is no `app/api/` directory in this repo — nothing to export server-side anyway.
- Everything under `/onboard` is a `"use client"` component.

Yet the project still ships and imports-by-existence:

- `src/prisma/prisma.ts` — `PrismaClient` + `PrismaPg` adapter + `pg.Pool` singleton
- `src/lib/redis.ts` — `ioredis` singleton hardcoded to `localhost:6379`
- `prisma/`, `prisma.config.ts`, and the `@prisma/client`, `@prisma/adapter-pg`, `pg`, `ioredis`,
  `bcryptjs` dependencies

None of these are imported by any component. They are leftovers from the abandoned
"Next.js talks to Postgres directly" design (see the commented-out block in `onboardingSlice.ts`).
They cost install time and lockfile weight, and if anything ever *did* import them from a client
component the build would fail with Node-builtin resolution errors.

The same applies to `docker-compose.yml`, which still stands up `postgres:15-alpine` + Adminer for a
database this app no longer talks to.

---

## 8. Build, deploy, and configuration

### Scripts

```bash
npm run dev      # next dev
npm run build    # next build  →  emits out/ (static export)
npm run start    # next start  ← meaningless with output:'export'
npm run lint     # eslint
```

### `next.config.ts`

```ts
{ output: 'export', trailingSlash: true, images: { unoptimized: true } }
```

`trailingSlash: true` makes the export emit `out/onboard/index.html`, which is what static hosts
(and the wildcard-domain setup) want.

### Exported routes (from `out/`)

`/`, `/onboard/`, `/_not-found/`, `/404.html`

### Environment variables (`.env`, gitignored)

| Var | Consumed by | Notes |
|---|---|---|
| `DATABASE_URL` | `prisma.config.ts` | CLI-only; unused at runtime |
| `NEXT_PUBLIC_LARAVEL_URL` | `src/assets/url.tsx` | Falls back to `https://laracom.brandwik.com/api/v1` |
| `NEXT_PUBLIC_MAIN_SITE_URL` | `url.tsx`, `Step1_Prompt`, `userCredentials` | Falls back to `""` — if unset, the subdomain suffix renders as a bare `"."` |
| `NEXT_PUBLIC_GOOGLE_ANALYTICS` | `app/layout.tsx` | Passed to `<GoogleAnalytics gaId>` |

Two commented-out `DATABASE_URL` variants and a commented `NEXT_PUBLIC_LARAVEL_URL` sit alongside,
recording the local-dev alternatives.

### Docker — **currently inconsistent**

`Dockerfile` is a 4-stage build (`base → deps → builder → runner`) ending with:

```dockerfile
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
CMD ["node", "server.js"]
```

That requires `output: 'standalone'` — the Dockerfile even says so in a comment. The config says
`output: 'export'`, so `.next/standalone` is never produced and **the `COPY` will fail at build
time**. The Docker path and the static-export path have diverged; only the static export is live.

`docker-compose.yml` also still declares the obsolete `version: '3.8'` key and wires
`DATABASE_URL`/`NEXT_PUBLIC_API_URL` env vars the app doesn't read.

### TLS / DNS

The README records the production certificate procedure: `acme.sh` with the Cloudflare DNS-01
challenge, issuing `brandwik.com` + `*.brandwik.com`. The wildcard is what makes per-tenant
subdomains (`<subdomain>.brandwik.com`) work.

---

## 9. Third-party / analytics stack

Five separate trackers load on every page from `app/layout.tsx`:

| Tool | Loading strategy | Configuration |
|---|---|---|
| **Mixpanel** | `<AnalyticsMixpanel/>` client component, `useEffect` on mount | Token hardcoded in `src/components/analytics/mixpanel.tsx`. `autocapture: true`, `record_sessions_percent: 100`, `debug: true`, `ignore_dnt: true`, `track_pageview: true` |
| **Microsoft Clarity** | inline `<Script strategy="afterInteractive">` | Project id `vp00rnwyl6` |
| **Tawk.to** (live chat) | inline `<Script strategy="lazyOnload">` | Widget id in the embed URL |
| **Contentsquare UXA** | plain `<Script src>` (no strategy) | `t.contentsquare.net/uxa/...` |
| **Google Analytics** | `@next/third-parties/google` | `gaId` from env |

Two flags deserve scrutiny: `record_sessions_percent: 100` means **every** session is screen-recorded
— including the onboarding form where users type an email, phone number, and password — and
`ignore_dnt: true` overrides browsers that send Do-Not-Track. `debug: true` also leaves Mixpanel
logging to the production console. Combined with Clarity and Contentsquare (both also session-replay
tools), this is three overlapping recording vendors on a form that handles credentials.

`app/layout.tsx` additionally imports `mixpanel-browser` at the top level without using it — the real
init happens in the child component.

---

## 10. Styling

Three styling systems coexist:

1. **Ant Design 6** — the component library. Themed globally in `ReduxProvider` via `ConfigProvider`
   (`defaultAlgorithm`, `colorPrimary: "#000000"`). `@ant-design/nextjs-registry` handles SSR style
   extraction.
2. **Tailwind CSS 4** — via `@import "tailwindcss"` in `app/globals.css` and the
   `@tailwindcss/postcss` plugin. Used for all layout inside the onboarding components
   (`flex`, `max-w-2xl`, `animate-fadeIn`, …).
3. **CSS Modules** — `app/LandingPage.module.css` (360 lines) exclusively for the landing page.

`globals.css` defines `--background` / `--foreground` with a `prefers-color-scheme: dark` override
and maps them into Tailwind via `@theme inline`, but then `body` hardcodes
`font-family: Arial, Helvetica, sans-serif`, overriding the Geist fonts loaded by `next/font` in the
layout. The dark-mode variables are also effectively cosmetic — Ant Design is pinned to the light
algorithm, so a dark-mode visitor gets dark page chrome around light AntD components.

Fonts: `Geist` and `Geist_Mono` via `next/font/google`, exposed as `--font-geist-sans` / `--font-geist-mono`.

---

## 11. The landing page (`app/page.tsx`)

A single 471-line client component rendering nine sections plus a footer:

1. Header with responsive `<Drawer>` mobile nav
2. Hero — headline, "Backed by Y Combinator" badge, **`Get Started` → `/onboard`** (the only real CTA)
3. Logo cloud / social proof
4. Feature grid (2 cards via a local `FeatureCard` helper)
5. "Simplify Your Workflow" — click-to-switch tab list (`track / analyze / team`)
6. "Streamline Your Operations" — 3 cards
7. Integrations tag cloud
8. Pricing — `Free / Pro / Enterprise` with a Monthly↔Yearly `Segmented` toggle (Pro: $49 → $39)
9. FAQ `<Collapse>` (4 items) and a final gradient CTA card
10. Footer with 4 link groups + social icons

All copy is placeholder marketing text for a fictional analytics product ("ShopWave"), unrelated to
the store-builder the funnel actually sells. All imagery points at `via.placeholder.com` (a service
that no longer resolves) and `ui-avatars.com`. Every nav link, pricing button, and footer link except
`Get Started` is inert.

---

## 12. Observations, risks, and rough edges

Ordered roughly by severity.

### Security / privacy

1. **Live Cloudflare API credentials are committed to `README.md`.** The file contains an exported
   `CF_Token`, `CF_Account_ID`, and `CF_Zone_ID` for the `brandwik.com` zone, appended below the
   default create-next-app boilerplate. `.env` is gitignored; the README is not. This token can
   modify DNS for the production domain — **it should be rotated in Cloudflare and stripped from git
   history**, not merely deleted from the working tree.
2. **Session replay over a credential form.** Mixpanel records 100 % of sessions with `ignore_dnt`,
   alongside Clarity and Contentsquare. `Details.tsx` collects email, phone, and a password in that
   same flow. Whatever the vendors' masking defaults are, this needs an explicit review.
3. **Full state persisted to localStorage.** With no `whitelist`, `redux-persist` writes the entire
   slice — including `users[customer_id]` (server-returned customer and site objects) — to
   localStorage, where it survives until `resetStepData()` runs. Note `resetStepData` clears
   `lead_id`/`customer_id`/`stepData` but **not** `users`, so those payloads linger after "Create New".
4. **Hardcoded Mixpanel project token** in `src/components/analytics/mixpanel.tsx` (client-side tokens
   are semi-public by nature, but it belongs in an env var alongside the GA id for parity).

### Correctness

5. **`Step1_Prompt.handleNext` doesn't await its save.**
   [Step1_Prompt.tsx:85-89](src/components/onboarding/Step1_Prompt.tsx#L85-L89) calls
   `dispatch(saveProgress()).unwrap()` **without `await`**, then immediately `setStep(1)`. Two
   consequences: the `try/catch` can never catch a rejection (making a failed save a silent unhandled
   promise rejection), and the user reaches step 1 before `lead_id` exists. Step 1 only reads
   `lead_id` at submit time so it usually recovers, but a fast submitter or a failed POST produces a
   `register` call with `lead_id: null`. Compare `Step2_Vibe.handleNext`, which *does* `await … .unwrap()`
   inside a try/catch — the correct pattern.
6. **`Details.onFinish` has no error handling at all.** Three sequential `fetch`/`await` calls with no
   `try/catch`: a network failure or a non-2xx from `/onboard/register` throws inside
   `data?.data.site` (reading `.site` of `undefined`), the form stays on step 1, and the user sees
   nothing. Also, if `CREATE_STORE` returns anything other than `status === "success"`, the funnel
   silently dead-ends with no message.
7. **`FEATURE_SUGGESTIONS` keys don't match the Step-0 options.** The map is keyed
   `fashion / restaurant / beauty / electronics / default`, but the select offers
   `online_store / blog / portfolio / restaurant`. Only *restaurant* matches; the other three always
   fall through to `default`. Either the select options or the map keys are stale.
8. **`Input.Password value={'121212'}`** at [Details.tsx:252](src/components/onboarding/Details.tsx#L252).
   A hardcoded `value` prop on a `Form.Item` child fights the form's own control injection — this is
   leftover test scaffolding and should be removed before it ships a fixed password.
9. **Unstable polling effect deps.** `userCredentials.tsx`'s poll effect depends on
   `[userData?.customer, userData?.site]` — object references pulled from the store. Any state write
   that replaces those objects tears down and recreates the 4 s interval. Depending on `siteId`
   (a string) would be stable.
10. **Admin password is a literal placeholder.** The credential panel renders the *string*
    `'adminPassword'` when revealed, and the show/copy controls are commented out. The real password
    never reaches the UI.
11. **Landing-page footer links are malformed.** `footerLinks.map` renders
    `<Link href={link} type="secondary">` where `link` is a label like `"Dashboard"` — producing a
    relative `href="Dashboard"`, passing an invalid `type` attribute to the anchor, and omitting the
    React `key` prop on the mapped element.
12. **Dead placeholder imagery.** Every `<img>` on the landing page points at `via.placeholder.com`,
    which no longer resolves — the hero, workflow preview, three operation cards, and CTA mockup all
    render broken.

### Consistency / hygiene

13. **Dockerfile vs `next.config.ts` mismatch** (§8) — the container build cannot succeed as written.
14. **Unused server stack** (§7) — Prisma, `pg`, `ioredis`, `bcryptjs`, and the compose Postgres
    service are all dead weight under static export.
15. **Prisma migration drift** (§6) — `schema.prisma` and the only migration describe different tables.
16. **`Building.tsx` hardcodes `http://localhost/api/v1/...`** instead of using the `URL` registry —
    a live landmine if that component is ever re-enabled.
17. **Naming collision:** `userCredentials.tsx` exports a component named `Building`, while a separate
    `Building.tsx` exists. The file is also the only lowercase-named component in the directory.
18. **Debug artifacts in the shipped funnel:** the `SetStep` button in the onboarding header, and
    `console.log` calls in `page.tsx`, `onboardingSlice.ts` (×2), `Step1_Prompt.tsx`, `Details.tsx`,
    and `userCredentials.tsx`.
19. **`app/layout.tsx` imports `mixpanel-browser` without using it.**
20. **`src/components/ui/AnimatedCard.tsx` is an empty file.**
21. **Landing page branding is unrelated to the product** — "ShopWave", a fictional e-commerce
    *analytics* dashboard, fronts a store *builder*. All copy, pricing, and FAQs are template text.
22. **README is still create-next-app boilerplate**, with operational notes (nvm/prisma/acme.sh
    commands) and secrets appended at the bottom.
23. **No tests, no CI, no pre-commit hooks.** `npm run lint` exists but isn't wired into the build.
24. **Coarse commit history** — 5 commits total (`Initial commit from Create Next App`,
    `first commit`, `inp`, `Working`, `inP`), spanning 2026-01-07 → 2026-03-02.

### Current working tree

5 files are modified and uncommitted: `README.md`, `app/layout.tsx`, `app/page.tsx`,
`src/assets/url.tsx`, `src/components/onboarding/Details.tsx`.

---

## 13. Suggested next steps

Roughly in priority order:

1. **Rotate the Cloudflare token** and purge it from git history (`git filter-repo` / BFG); move the
   acme.sh notes to a non-tracked runbook.
2. **Fix the two async bugs** — `await` the thunk in `Step1_Prompt.handleNext`, and wrap
   `Details.onFinish` in `try/catch` with user-visible error state (the slice already has an `error`
   field going unused in the UI).
3. **Reconcile `FEATURE_SUGGESTIONS` keys with the business-type select** — right now three of four
   business types get generic suggestions.
4. **Remove the `value={'121212'}` password default** and the `SetStep` debug button before any
   further release.
5. **Decide the deployment story**: either flip `next.config.ts` to `output: 'standalone'` and keep
   the Dockerfile, or delete the Dockerfile/compose and document the static-host pipeline. As it
   stands, half the repo describes a deployment that cannot build.
6. **Delete or quarantine the dead server layer** — `src/prisma/`, `src/lib/redis.ts`, `prisma/`,
   and the `@prisma/*`/`pg`/`ioredis`/`bcryptjs` dependencies — or, if Prisma is genuinely coming
   back, regenerate the migration so the schema and SQL agree.
7. **Scope `redux-persist`** with a `whitelist` that excludes `users`, and make `resetStepData` clear
   it too.
8. **Audit the analytics stack**: three session-replay vendors is likely two too many, and
   `record_sessions_percent: 100` + `ignore_dnt: true` + `debug: true` over a credential form
   warrants an explicit privacy decision.
9. **Resolve the dormant components** — either wire `Step2_Vibe` / `Step5_Reveal` back into the
   funnel (and renumber the steps coherently) or delete them; `Building.tsx` is fully superseded.
10. **Replace the landing page** with real product copy and working imagery, or gate `/` behind the
    real marketing site and ship only `/onboard`.
