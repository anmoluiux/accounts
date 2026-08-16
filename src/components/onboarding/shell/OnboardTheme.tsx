"use client";

import { ConfigProvider, type ThemeConfig } from "antd";

/**
 * Brand theme for the onboarding funnel only.
 *
 * Nests inside the app-wide `ConfigProvider` in `ReduxProvider` (tokens merge,
 * the light algorithm is inherited), so restyling the funnel cannot leak into
 * the landing page. Tokens are the mechanism on purpose: theming AntD through
 * its own design tokens keeps every control consistent without the
 * `!important` overrides that the old steps were accumulating.
 *
 * Hoisted to module scope — an inline object literal would be a new identity on
 * every render, recomputing the token set and pushing fresh context to every
 * AntD component below.
 */
const onboardTheme: ThemeConfig = {
  token: {
    colorPrimary: "#2e4b3a",
    colorLink: "#2e4b3a",
    colorSuccess: "#3f8f63",
    colorError: "#b4462f",
    colorText: "#16191a",
    colorTextSecondary: "#5c625c",
    colorTextPlaceholder: "#a0a49c",
    colorBorder: "#dedbcc",
    colorBgContainer: "#ffffff",
    borderRadius: 10,
    controlHeight: 40,
    controlHeightLG: 48,
    fontFamily:
      'var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
    fontSize: 14,
    lineWidth: 1,
  },
  components: {
    Button: {
      primaryShadow: "none",
      defaultShadow: "none",
      fontWeight: 600,
    },
    Input: {
      paddingBlockLG: 11,
      activeShadow: "0 0 0 3px rgba(46, 75, 58, 0.12)",
      errorActiveShadow: "0 0 0 3px rgba(180, 70, 47, 0.12)",
    },
    Select: {
      optionSelectedBg: "#eaefe9",
      optionSelectedFontWeight: 600,
    },
    Checkbox: {
      borderRadiusSM: 5,
    },
    Form: {
      labelColor: "#16191a",
      labelFontSize: 13,
      verticalLabelPadding: "0 0 7px",
      itemMarginBottom: 19,
    },
  },
};

export default function OnboardTheme({ children }: { children: React.ReactNode }) {
  return <ConfigProvider theme={onboardTheme}>{children}</ConfigProvider>;
}
