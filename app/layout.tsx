import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/src/store/ReduxProvider";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { GoogleAnalytics } from '@next/third-parties/google';
import Script from "next/script";
import AnalyticsMixpanel from "@/src/components/analytics/mixpanel";
import { ANALYTICS_ENABLED } from "@/src/assets/config";
import { JsonLd } from "@/src/components/seo/JsonLd";
import { OG_IMAGE, SITE, ogImage } from "@/src/lib/seo/config";
import { organizationSchema } from "@/src/lib/seo/schema";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Site-wide defaults. Every page overrides `title` and most override
 * `description`, `alternates.canonical` and `robots`; anything a page does not
 * set is inherited from here.
 */
export const metadata: Metadata = {
  /**
   * The single most important line in this file.
   *
   * Next resolves every relative `openGraph.images` / `twitter.images` path
   * against this to produce the absolute URL it writes into the HTML. The Open
   * Graph spec requires `og:image` to be absolute and no scraper — WhatsApp,
   * Facebook, X, LinkedIn, Slack, iMessage — will resolve a relative one.
   * Unset, Next falls back to `http://localhost:3000` and *every* preview
   * silently breaks in production.
   */
  metadataBase: new URL(SITE.url),

  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    /**
     * Pages set a bare title ("Create your store") and get the brand appended.
     * Keeps the distinguishing words at the front, where they survive the
     * ~60-character truncation in Google results and in a browser tab.
     */
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,

  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: SITE.marketingUrl }],
  creator: SITE.name,
  publisher: SITE.name,
  category: "technology",
  keywords: [...SITE.keywords],

  /**
   * Send the full URL on same-origin and same-site navigations but only the
   * origin cross-origin, so laracom sees that traffic came from this host
   * without leaking whatever the visitor typed into the funnel via the
   * `Referer` header.
   */
  referrer: "origin-when-cross-origin",

  /**
   * Stops iOS Safari turning digits in the page into blue "call this" links.
   * The funnel renders order numbers, prices and subdomains that are not phone
   * numbers and should not be tappable.
   */
  formatDetection: { email: false, telephone: false, address: false },

  /**
   * Declared explicitly rather than relying on Next's `app/icon.*` convention.
   *
   * That convention emits extensionless, content-hashed URLs
   * (`/icon-2a1f?b3c`), which a static host serves without an image
   * Content-Type. Plain files under `public/` get the right MIME type from
   * every host, and the URLs stay stable across deploys so browsers and
   * scrapers can actually cache them.
   */
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48", type: "image/x-icon" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",

  /** Controls the label and status bar when the funnel is saved to an iOS home screen. */
  appleWebApp: { capable: true, title: SITE.name, statusBarStyle: "black-translucent" },

  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: SITE.locale,
    url: "/",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: ogImage(OG_IMAGE.default, `${SITE.name} — ${SITE.tagline}`),
  },

  /**
   * X reads its own namespace and ignores `og:*` for card type. `summary_large_image`
   * is what turns a 1200×630 image into a full-width card instead of a small
   * square thumbnail.
   */
  twitter: {
    card: "summary_large_image",
    site: SITE.twitter,
    creator: SITE.twitter,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: ogImage(OG_IMAGE.default, `${SITE.name} — ${SITE.tagline}`),
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      /** Uncapped preview text/images — the defaults let Google clip snippets short. */
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

/**
 * Split from `metadata` because Next requires it: `themeColor`, `colorScheme`
 * and `viewport` moved into their own export in Next 14 and are ignored if left
 * in the metadata object.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  /**
   * Tints the browser UI around the page. Worth getting right here specifically
   * because most shared links are opened in the in-app browsers of WhatsApp,
   * Instagram and LinkedIn, which all honour it — it is the first frame of
   * brand a visitor sees, before the page paints.
   */
  themeColor: SITE.themeColor,
  /**
   * The funnel is a committed light-on-cream design with AntD pinned to its
   * light algorithm, so the shell already declares `color-scheme: light`.
   * Saying so at the document level stops a visitor whose OS is in dark mode
   * getting dark-inverted form controls and scrollbars.
   */
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Identifies the brand on this host and points at the same
            `@id` bravo uses, so the two hosts merge into one entity rather than
            competing as two companies with the same name. Server-rendered into
            the static HTML — most crawlers and every link-preview bot read the
            raw response, not the hydrated DOM. */}
        <JsonLd data={organizationSchema()} id="schema-organization" />

        <AntdRegistry>
          <ReduxProvider>{children}</ReduxProvider>
        </AntdRegistry>

        {ANALYTICS_ENABLED && (
          <>
            <AnalyticsMixpanel />

            <Script id="microsoft-clarity" strategy="afterInteractive">
              {`
                (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "vp00rnwyl6");
              `}
            </Script>
            <Script id="tawk-to" strategy="lazyOnload">
              {`
                var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
                (function(){
                  var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                  s1.async=true;
                  s1.src='https://embed.tawk.to/69a4540dfa890a1c3951d245/1jikugljf';
                  s1.charset='UTF-8';
                  s1.setAttribute('crossorigin','*');
                  s0.parentNode.insertBefore(s1,s0);
                })();
              `}
            </Script>
            <Script src="https://t.contentsquare.net/uxa/8bccebed2b7ac.js"></Script>

            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS as string} />
          </>
        )}
      </body>
    </html>
  );
}
