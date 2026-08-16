"use client";

import { useState } from "react";
import Link from "next/link";
import { Alert, Button, Input } from "antd";
import { URL, MARKETING_URL } from "@/src/assets/url";
// Shares the funnel's form primitives (.stepTitle, .field, .label, …) so the
// two screens cannot drift apart typographically.
import styles from "@/src/components/onboarding/onboard.module.css";

type Mode = "password" | "magic";

/**
 * Sign-in form. Lives beside the same showcase panel as the funnel.
 *
 * ⚠️ NEITHER ENDPOINT EXISTS IN LARACOM YET — see the note on `URL.LOGIN`. The
 * form is wired for real: it posts, reads the standard { status, data, message }
 * envelope, and reports failures. What it will not do is fake a success. Until
 * the routes land, a submit surfaces "Sign-in isn't available yet", which is the
 * truth, rather than spinning forever or bouncing to a page that rejects them.
 */
export default function LoginForm() {
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [magicSent, setMagicSent] = useState(false);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError("");
    setMagicSent(false);
  };

  /**
   * One request helper for both flows.
   *
   * `res.json()` is guarded: a missing route returns Laravel's HTML 404 page,
   * and parsing that throws a SyntaxError that would otherwise surface to the
   * customer as "Unexpected token <".
   */
  const post = async (endpoint: string, body: Record<string, string>) => {
    let res: Response;

    try {
      res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
      });
    } catch {
      // fetch only rejects on a transport failure — offline, DNS, CORS, or the
      // API simply not running. Left unhandled the customer reads "Failed to
      // fetch", which is a browser string, not an explanation.
      throw new Error("We couldn't reach the server. Check your connection and try again.");
    }

    const payload = await res.json().catch(() => null);

    if (res.status === 404 || res.status === 405) {
      throw new Error("Sign-in isn't available yet. Please contact support and we'll get you in.");
    }
    if (!res.ok || payload?.status === "error") {
      throw new Error(payload?.message || "We couldn't sign you in. Please check your details and try again.");
    }

    return payload?.data;
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || !password || isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    try {
      const data = await post(URL.LOGIN, { email, password });

      // laracom owns where a signed-in customer lands — their store admin, which
      // lives on a different host, so this is a full navigation rather than a
      // router push. No redirect means the contract was not met; say so instead
      // of leaving them on a form that looks like it did nothing.
      if (!data?.redirect_url) {
        throw new Error("Signed in, but no destination came back. Please contact support.");
      }
      window.location.href = data.redirect_url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleMagicSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    try {
      await post(URL.MAGIC_LINK, { email });
      setMagicSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className={styles.stepHead}>
        <h2 className={styles.stepTitle}>Welcome back</h2>
        <p className={styles.stepSubtitle}>
          Your stores kept selling while you were away. Let&apos;s pick up where you left off.
        </p>
      </div>

      {/* Disabled, not hidden: Google sign-in needs OAuth infrastructure that
          laracom does not have (no Socialite, no redirect URIs), so this is not
          a matter of one missing endpoint. Showing it live would be a button
          that silently does nothing. */}
      <button type="button" className={styles.oauthButton} disabled>
        <GoogleMark />
        Continue with Google
        <span className={styles.pill}>Soon</span>
      </button>

      <div className={styles.divider}>OR</div>

      <div className={styles.tabs} role="tablist" aria-label="Sign-in method">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "password"}
          className={`${styles.tab}${mode === "password" ? ` ${styles.tabActive}` : ""}`}
          onClick={() => switchMode("password")}
        >
          Password
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "magic"}
          className={`${styles.tab}${mode === "magic" ? ` ${styles.tabActive}` : ""}`}
          onClick={() => switchMode("magic")}
        >
          Magic link
        </button>
      </div>

      {mode === "password" ? (
        <form className={styles.fields} onSubmit={handlePasswordSubmit}>
          {/* Email, not "username": laracom identifies customers by email
              everywhere else in this app (/onboard/check-email, register). */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="login-email">
              Email
            </label>
            <Input
              id="login-email"
              size="large"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <div className={styles.fieldRow}>
              <label className={styles.label} htmlFor="login-password">
                Password
              </label>
              {/* There is no password-reset flow yet either, so this points at
                  support rather than a /forgot-password route that would 404.
                  Swap the href once laracom has one. */}
              <a
                className={styles.inlineLink}
                href={`${MARKETING_URL}/contact`}
                target="_blank"
                rel="noreferrer"
              >
                Forgot password?
              </a>
            </div>
            <Input.Password
              id="login-password"
              size="large"
              placeholder="••••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <Alert type="error" showIcon message={error} closable onClose={() => setError("")} />}

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            className={styles.submit}
            loading={isSubmitting}
            disabled={!email || !password || isSubmitting}
          >
            Sign in
          </Button>
        </form>
      ) : (
        <form className={styles.fields} onSubmit={handleMagicSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="magic-email">
              Email
            </label>
            <Input
              id="magic-email"
              size="large"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <span className={styles.hint}>We&apos;ll email you a link that signs you in. No password needed.</span>
          </div>

          {error && <Alert type="error" showIcon message={error} closable onClose={() => setError("")} />}
          {magicSent && (
            <Alert
              type="success"
              showIcon
              message="Check your inbox"
              description={`If an account exists for ${email}, a sign-in link is on its way.`}
            />
          )}

          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            className={styles.submit}
            loading={isSubmitting}
            disabled={!email || isSubmitting}
          >
            Send magic link
          </Button>
        </form>
      )}

      <p className={styles.altAction}>
        New to Brandwik? <Link href="/onboard">Start your free store</Link>
      </p>
    </div>
  );
}

/* Google's own mark, as their sign-in branding guidelines require for this
   button. Inline so the button costs no extra request. */
function GoogleMark() {
  return (
    <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}
