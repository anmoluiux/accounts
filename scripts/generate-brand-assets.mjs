/**
 * Generates every brand image the metadata layer points at.
 *
 *     npm run brand:assets
 *
 * Writes into `public/`:
 *   og/brandwik-og.png          1200×630  default social card
 *   og/brandwik-onboard-og.png  1200×630  signup-specific social card
 *   icon.svg                              scalable favicon (modern browsers)
 *   favicon.ico                 16/32/48  legacy favicon + browser default request
 *   apple-touch-icon.png        180×180   iOS home screen
 *   icon-192.png, icon-512.png            PWA manifest
 *   icon-maskable-512.png                 Android adaptive icon
 *
 * ── Why this is a script and not `opengraph-image.tsx` ────────────────────
 * This app is a static export. Next's metadata-image convention emits the PNG
 * to an extensionless path (`/onboard/opengraph-image-5a60y9`), which a static
 * host serves as `application/octet-stream`. Every social scraper drops an
 * `og:image` that is not served as `image/*`, so the preview silently collapses
 * to a bare link. Committed `.png` files are served with the right MIME type by
 * every host, with no configuration.
 *
 * Output is committed. Re-run only when the branding changes.
 *
 * Dependencies are all already in the tree: `next/og` (satori) for the text
 * cards, `sharp` for rasterising the icon SVGs.
 */
import { ImageResponse } from "next/og.js"; // .js — `next` has no exports map, so bare `next/og` will not resolve under ESM
import { createElement as h } from "react";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = path.join(ROOT, "public");

// ── Brand tokens ─────────────────────────────────────────────────────────────
// Kept in sync by hand with `.shell` in src/components/onboarding/onboard.module.css.
const C = {
  forestDeep: "#101a14",
  forest: "#2e4b3a",
  mint: "#4fa97a",
  cream: "#eff0e7",
  creamSoft: "rgba(239, 240, 231, 0.68)",
  creamFaint: "rgba(239, 240, 231, 0.42)",
  line: "rgba(239, 240, 231, 0.14)",
  card: "rgba(239, 240, 231, 0.06)",
};

/** The lightning mark from ShowcasePanel. Authored in a 13.5 × 20 box at (4.5, 2). */
const BOLT_D = "M14 2 4.5 13.6h5.4L8.6 22 18 10.4h-5.4z";
const BOLT = { x: 4.5, y: 2, w: 13.5, h: 20 };

const fonts = [
  { name: "Geist", weight: 400, style: "normal", data: await readFile(path.join(ROOT, "scripts/fonts/Geist-Regular.ttf")) },
  { name: "Geist", weight: 700, style: "normal", data: await readFile(path.join(ROOT, "scripts/fonts/Geist-Bold.ttf")) },
];

// ── Social cards ─────────────────────────────────────────────────────────────

/** The mark, sized in px, as a satori-renderable <svg>. */
const boltSvg = (px, fill = C.cream) =>
  h("svg", { width: (px * BOLT.w) / BOLT.h, height: px, viewBox: `${BOLT.x} ${BOLT.y} ${BOLT.w} ${BOLT.h}` }, h("path", { d: BOLT_D, fill }));

const wordmark = () =>
  h("div", { style: { display: "flex", alignItems: "center", gap: 18 } }, [
    h(
      "div",
      {
        key: "tile",
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 76,
          height: 76,
          borderRadius: 22,
          background: C.card,
          border: `1px solid ${C.line}`,
        },
      },
      boltSvg(40),
    ),
    h("div", { key: "name", style: { display: "flex", fontSize: 40, fontWeight: 700, color: C.cream, letterSpacing: -1 } }, "Brandwik"),
  ]);

/** Small outlined pill, used for the step strip and the URL chip. */
const pill = (key, text, { strong = false } = {}) =>
  h(
    "div",
    {
      key,
      style: {
        display: "flex",
        alignItems: "center",
        borderRadius: 999,
        padding: "11px 22px",
        fontSize: 22,
        fontWeight: strong ? 700 : 400,
        color: strong ? C.forestDeep : C.creamSoft,
        background: strong ? C.mint : "transparent",
        border: `1px solid ${strong ? C.mint : C.line}`,
      },
    },
    text,
  );

/**
 * A block of text, one element per line.
 *
 * Lines are passed in pre-wrapped rather than letting satori wrap them. On a
 * fixed 1200×630 canvas the break points are a design decision, and hard-coding
 * them keeps the ragged edge where it was drawn instead of wherever satori's
 * text measurement happens to land after a copy edit or a satori upgrade.
 *
 * Word gaps come out very slightly uneven — satori over-measures the trailing
 * advance of words ending in `k`/`t`/`e`, which a browser rendering the same
 * TTF does not. It is a ~6px difference on a 1200px canvas, i.e. under 2px at
 * the ~330px WhatsApp and ~500px X render sizes, and invisible there. Laying
 * words out individually with a flex `gap` was tried and does not help: the
 * over-measure is inside each word's own box, so a uniform gap sits on top of
 * an uneven one. Not worth a second renderer.
 */
const lines = (text, { size, weight = 400, color, letterSpacing = 0, leading = 1.16 }) =>
  h(
    "div",
    { style: { display: "flex", flexDirection: "column" } },
    text.map((t, i) =>
      h("div", { key: i, style: { display: "flex", fontSize: size, fontWeight: weight, color, letterSpacing, lineHeight: leading } }, t),
    ),
  );

/**
 * Every card shares one frame so the two previews read as the same brand.
 *
 * Content sits inside 72px padding: WhatsApp and X both crop social cards
 * slightly on narrow screens, and anything closer to the edge risks being cut.
 */
const card = ({ headline, sub, footer }) =>
  h(
    "div",
    {
      style: {
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: 72,
        background: C.forestDeep,
        backgroundImage: `radial-gradient(900px 620px at 88% -12%, ${C.forest} 0%, rgba(46,75,58,0.42) 42%, rgba(16,26,20,0) 72%)`,
        fontFamily: "Geist",
      },
    },
    [
      // Oversized mark bleeding off the right edge, barely visible. Gives the
      // card depth without another element competing with the headline.
      h(
        "div",
        { key: "watermark", style: { position: "absolute", top: 96, right: -108, display: "flex", opacity: 0.06 } },
        boltSvg(560, C.mint),
      ),

      h("div", { key: "top", style: { display: "flex" } }, wordmark()),

      h("div", { key: "body", style: { display: "flex", flexDirection: "column" } }, [
        h("div", { key: "h", style: { display: "flex" } }, lines(headline, { size: 74, weight: 700, color: C.cream, letterSpacing: -2, leading: 1.14 })),
        h("div", { key: "s", style: { display: "flex", marginTop: 28 } }, lines(sub, { size: 27, color: C.creamSoft, leading: 1.45 })),
        h("div", { key: "f", style: { display: "flex", alignItems: "center", gap: 12, marginTop: 38 } }, footer),
      ]),
    ],
  );

const CARDS = [
  {
    file: "og/brandwik-og.png",
    node: card({
      // Pre-wrapped: see `line()`. Keep each headline line under ~30 characters
      // so it clears the watermark on the right.
      headline: ["Your store, live before", "your coffee gets cold."],
      sub: ["Pick a name, tell us what you sell, and", "Brandwik builds the storefront for you."],
      // Factual, checkable claims only. No ratings or review counts: the
      // testimonials in showcase.data.ts are still placeholders, and inventing
      // social proof on a share card is the same problem as inventing it in
      // JSON-LD.
      footer: [pill("a", "brandwik.com", { strong: true }), pill("b", "No code"), pill("c", "No designer")],
    }),
  },
  {
    file: "og/brandwik-onboard-og.png",
    node: card({
      headline: ["Create your", "online store."],
      sub: ["Three steps to a live storefront — name it,", "describe what you sell, and we host the rest."],
      // Mirrors the real funnel (STEP_COUNT = 3 in showcase.data.ts).
      footer: [pill("1", "1 · Name it"), pill("2", "2 · Describe it"), pill("3", "3 · Go live", { strong: true })],
    }),
  },
];

// ── Icons ────────────────────────────────────────────────────────────────────

/** Centres the mark in an S×S box at `frac` of the box height. */
const boltPath = (S, frac, fill) => {
  const height = S * frac;
  const scale = height / BOLT.h;
  const tx = (S - BOLT.w * scale) / 2 - BOLT.x * scale;
  const ty = (S - height) / 2 - BOLT.y * scale;
  return `<path d="${BOLT_D}" fill="${fill}" transform="translate(${tx} ${ty}) scale(${scale})"/>`;
};

/**
 * @param radius  corner radius in px. 0 for Apple and maskable icons — iOS and
 *                Android apply their own mask, and pre-rounding shows the
 *                rounding twice with a sliver of background in the corners.
 * @param frac    mark height as a fraction of the canvas. Maskable icons must
 *                keep everything meaningful inside the middle 80%, so the mark
 *                shrinks rather than risk being clipped by a circular mask.
 */
const iconSvg = (S, { radius = S * 0.22, frac = 0.5 } = {}) => `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${C.forest}"/><stop offset="1" stop-color="${C.forestDeep}"/>
  </linearGradient></defs>
  <rect width="${S}" height="${S}" rx="${radius}" fill="url(#g)"/>
  ${boltPath(S, frac, C.cream)}
</svg>`;

const png = (svg, size) => sharp(Buffer.from(svg)).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

/**
 * Minimal ICO container wrapping PNG payloads.
 *
 * Every browser that still asks for /favicon.ico understands PNG-in-ICO, and it
 * avoids pulling in a BMP encoder for three tiny images.
 * Layout: 6-byte ICONDIR, then one 16-byte ICONDIRENTRY per image, then data.
 */
const buildIco = (images) => {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: 1 = icon
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, buf }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0); // 0 encodes 256
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(buf.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += buf.length;
    return e;
  });

  return Buffer.concat([header, ...entries, ...images.map((i) => i.buf)]);
};

// ── Run ──────────────────────────────────────────────────────────────────────
const written = [];
const write = async (rel, buf) => {
  const dest = path.join(PUBLIC, rel);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, buf);
  written.push([rel, buf.length]);
};

await Promise.all(
  CARDS.map(async ({ file, node }) =>
    write(file, Buffer.from(await new ImageResponse(node, { width: 1200, height: 630, fonts }).arrayBuffer())),
  ),
);

await write("icon.svg", Buffer.from(iconSvg(512)));
await write("apple-touch-icon.png", await png(iconSvg(512, { radius: 0, frac: 0.46 }), 180));
await write("icon-192.png", await png(iconSvg(512), 192));
await write("icon-512.png", await png(iconSvg(512), 512));
await write("icon-maskable-512.png", await png(iconSvg(512, { radius: 0, frac: 0.4 }), 512));
await write(
  "favicon.ico",
  buildIco(
    await Promise.all(
      // A slightly larger mark at favicon sizes; at 16px the default proportion
      // reads as a smudge in a browser tab.
      [16, 32, 48].map(async (size) => ({ size, buf: await png(iconSvg(512, { radius: 96, frac: 0.58 }), size) })),
    ),
  ),
);

const pad = Math.max(...written.map(([f]) => f.length));
for (const [file, bytes] of written) console.log(`  public/${file.padEnd(pad)}  ${(bytes / 1024).toFixed(1)} kB`);
console.log(`\n${written.length} brand assets written.`);
