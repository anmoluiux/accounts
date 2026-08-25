"use client";

import { useMemo, useState } from "react";
import { Input, Select } from "antd";
import { COUNTRIES, flagSrc } from "./countries";
import styles from "./onboard.module.css";

/**
 * Which flag the field starts on.
 *
 * India, because the platform bills through Razorpay and the storefront ships a
 * `directupi_payments` extension — both India-only. Change this one constant to
 * move the default; nothing else reads it.
 */
const DEFAULT_ISO2 = "IN";

/**
 * Dial codes are not unique — +1 covers the whole NANP, +44 covers the UK and
 * three Crown dependencies — so a stored "+44…" cannot say which country was
 * picked. Longest-prefix match reads the code back, and the `p` (primary) flag
 * settles the tie: without it "+44…" came back as Guernsey.
 *
 * Sorted longest-first so "+1" cannot shadow "+1242" (Bahamas).
 */
const BY_DIAL_LENGTH = [...COUNTRIES].sort((a, b) => b.d.length - a.d.length);

function splitValue(value: string | undefined): { iso2: string; national: string } {
  if (!value) return { iso2: DEFAULT_ISO2, national: "" };

  const compact = value.replace(/[^\d+]/g, "");
  const hit = BY_DIAL_LENGTH.find((c) => compact.startsWith(c.d));

  if (!hit) return { iso2: DEFAULT_ISO2, national: compact.replace(/^\+/, "") };

  const primary = COUNTRIES.find((c) => c.d === hit.d && c.p) ?? hit;

  return { iso2: primary.c, national: compact.slice(hit.d.length) };
}

/** "+91" and "91" and " 91 " all normalise to "91" so either spelling matches. */
const normalise = (q: string) => q.trim().toLowerCase().replace(/^\+/, "");

/**
 * Phone number with a searchable country prefix.
 *
 * Controlled through a `value`/`onChange` pair, so AntD's `Form.Item` drives it
 * exactly like a built-in control — no adapter in the parent, and the existing
 * validation rules keep working. `value` is the joined string ("+919876543210");
 * splitting it into flag and national number is this component's own business.
 *
 * The `Select` sits in the `Input`'s `prefix` slot rather than in `addonBefore`
 * (deprecated in AntD 6) or a `Space.Compact` pair. Both of those render a
 * SECOND bordered box, which reads as two controls and shows two focus rings;
 * in `prefix` there is one border and one focus ring, matching how
 * Step1_Prompt hangs the `.brandwik.com` tail inside the address field.
 */
export default function PhoneField({
  value,
  onChange,
  disabled,
}: {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}) {
  // The country the user actually clicked. Kept because `value` alone cannot
  // express it: clearing the number clears the dial code with it, and deriving
  // the flag from an empty string would snap it back to the default — pick the
  // UK, type, delete, and you are in India again.
  const [pickedIso2, setPickedIso2] = useState(() => splitValue(value).iso2);
  const pickedDial = COUNTRIES.find((c) => c.c === pickedIso2)?.d ?? "";

  // A `value` that does not start with the picked country's code did not come
  // from this component — it is redux-persist rehydrating a returning user's
  // number — so adopt the country it encodes. Deriving this during render
  // rather than syncing it in an effect is not a style preference: setState in
  // an effect body cascades an extra render, and the React compiler's lint
  // rejects it outright.
  const external = Boolean(value) && !value!.startsWith(pickedDial);
  const iso2 = external ? splitValue(value).iso2 : pickedIso2;

  // Slicing by the known dial code, not re-parsing: re-parsing "+1555…" would
  // resolve the shared NANP code to whichever country sorts first, so choosing
  // Canada and typing would visibly flip the flag to Anguilla.
  const national = external ? splitValue(value).national : (value?.slice(pickedDial.length) ?? "");

  // Built once. 248 options each carrying two JSX labels is enough work to show
  // up in the typing path of the number field sitting immediately beside it.
  const options = useMemo(
    () =>
      COUNTRIES.map((c) => ({
        value: c.c,
        name: c.n,
        dial: c.d,
        // Flattened at build time so filtering is a substring test on a plain
        // string rather than a walk into React elements on every keystroke.
        search: `${c.n} ${c.c} ${c.d.replace("+", "")} ${c.a ?? ""}`.toLowerCase(),
        aliases: c.a ? c.a.split(" ") : [],
        primary: c.p === 1,
        // The closed control: flag and code only, so the prefix stays narrow
        // enough to leave the number itself room.
        label: (
          <span className={styles.phoneValue}>
            {/* eslint-disable-next-line @next/next/no-img-element -- a fixed
                20x15 static SVG; next/image would add a wrapper and a loader
                config for an asset that needs neither, and `unoptimized` is
                already forced by `output: 'export'`. */}
            <img className={styles.phoneFlag} src={flagSrc(c.c)} alt={c.n} width={20} height={15} loading="lazy" decoding="async" />
            <span className={styles.phoneDial}>{c.d}</span>
          </span>
        ),
        // The open dropdown: the country name, because that is what someone
        // scanning a 248-row list is actually reading.
        optionLabel: (
          <span className={styles.phoneOption}>
            {/* alt="" — the country name is the very next node, so naming the
                flag too would have a screen reader read every row twice. */}
            {/* eslint-disable-next-line @next/next/no-img-element -- see above */}
            <img className={styles.phoneFlag} src={flagSrc(c.c)} alt="" width={20} height={15} loading="lazy" decoding="async" />
            <span className={styles.phoneOptionName}>{c.n}</span>
            <span className={styles.phoneOptionDial}>{c.d}</span>
          </span>
        ),
      })),
    []
  );

  const emit = (nextIso2: string, nextNational: string) => {
    // Any edit settles the country, which is what re-syncs `pickedIso2` after
    // an adopted external value.
    setPickedIso2(nextIso2);

    const nextDial = COUNTRIES.find((c) => c.c === nextIso2)?.d ?? "";
    // An empty number emits "" rather than a bare "+91", so a `required` rule
    // still fails on an untouched field and no lead is stored holding nothing
    // but a country code.
    onChange?.(nextNational ? `${nextDial}${nextNational}` : "");
  };

  return (
    <Input
      size="large"
      inputMode="tel"
      autoComplete="tel-national"
      placeholder="9876543210"
      disabled={disabled}
      value={national}
      onChange={(e) => {
        const raw = e.target.value;

        // Someone pasting a full international number ("+44 20 7123 4567")
        // would otherwise have its country code appended to the one already
        // selected, producing "+91442071234567". Re-parse anything starting
        // with a plus and move the flag to match instead.
        if (raw.trimStart().startsWith("+")) {
          const pasted = splitValue(raw);
          emit(pasted.iso2, pasted.national);
          return;
        }

        // Digits only. Allowing spaces looked fine until you typed one: the
        // value round-trips through `emit` -> `value` -> `national`, which
        // strips them, so the space vanished as it was typed and the caret
        // jumped. Refusing them outright is the honest version.
        emit(iso2, raw.replace(/\D/g, ""));
      }}
      prefix={
        // The affix wrapper focuses the text input on ANY click inside itself
        // (@rc-component/input BaseInput's `onInputClick`), which would pull
        // focus off the Select the instant it was clicked and shut the dropdown
        // again. Stopping the click here is what makes the prefix placement
        // viable at all.
        <span
          className={styles.phonePrefix}
          role="presentation"
          onClick={(e) => e.stopPropagation()}
        >
          <Select
            value={iso2}
            onChange={(next) => emit(next, national)}
            disabled={disabled}
            variant="borderless"
            showSearch
            // Name, ISO code and dial code share one haystack, so "india", "IN",
            // "91" and "+91" all find India.
            filterOption={(input, option) => {
              const q = normalise(input);
              return !q || !!option?.search.includes(q);
            }}
            // Filtering alone would put Bolivia (+591) above India for "91" and
            // Guernsey above the United Kingdom for "44": both are substring
            // matches and AntD does not rank. Exact code or ISO match first,
            // then codes starting with the query, then names — and within a
            // tier the primary territory for a shared code outranks the rest.
            filterSort={(a, b, { searchValue }) => {
              const q = normalise(searchValue);
              const rank = (o: (typeof options)[number]) => {
                const dial = o.dial.replace("+", "");
                // A whole alias counts as an exact hit, not a loose one:
                // "uk" is an alias of the United Kingdom but merely a prefix of
                // Ukraine, and without this tier Ukraine came first.
                if (dial === q || o.value.toLowerCase() === q || o.aliases.includes(q)) return 0;
                if (dial.startsWith(q)) return 1;
                if (o.name.toLowerCase().startsWith(q)) return 2;
                return 3;
              };
              return (
                rank(a) - rank(b) ||
                Number(b.primary) - Number(a.primary) ||
                a.name.localeCompare(b.name)
              );
            }}
            optionRender={(option) => option.data.optionLabel}
            options={options}
            // Without this the list inherits the collapsed prefix's width and
            // truncates every country name to a few characters.
            popupMatchSelectWidth={288}
            classNames={{ popup: { root: styles.phonePopup } }}
            suffixIcon={<ChevronIcon />}
          />
        </span>
      }
    />
  );
}

function ChevronIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
