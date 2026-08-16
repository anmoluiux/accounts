import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/src/store/ReduxProvider";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { GoogleAnalytics } from '@next/third-parties/google';
import Script from "next/script";
import AnalyticsMixpanel from "@/src/components/analytics/mixpanel";
import { ANALYTICS_ENABLED } from "@/src/assets/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Accounts",
  description: "SaaS Platform for Account Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
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
