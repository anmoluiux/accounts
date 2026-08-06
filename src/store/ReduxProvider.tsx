"use client";

import { createContext, useContext, useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "./store";
import { persistStore, type Persistor } from "redux-persist";
import { ConfigProvider, theme, type ThemeConfig } from "antd";

// Hoisted: as an inline literal this was a new object every render, so
// ConfigProvider recomputed its design tokens and pushed a new context value
// down to every antd component in the tree.
const antdTheme: ThemeConfig = {
  algorithm: theme.defaultAlgorithm, // light theme
  token: {
    colorPrimary: "#000000", // BLACK primary color
  },
};

// The persistor is published on context rather than being consumed by a
// PersistGate here. PersistGate renders null until redux-persist rehydrates,
// which only happens in the browser after mount — so wrapping the root layout
// in one meant the static export prerendered an empty <body> for every route,
// including the marketing page. Routes that genuinely need to wait for
// rehydration opt in with <PersistBoundary> instead.
const PersistorContext = createContext<Persistor | null>(null);

export const usePersistor = () => useContext(PersistorContext);

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  const persistorRef = useRef<Persistor | null>(null);

  if (!storeRef.current) {
    storeRef.current = makeStore();
    persistorRef.current = persistStore(storeRef.current);
  }

  return (
    <Provider store={storeRef.current}>
      <PersistorContext.Provider value={persistorRef.current}>
        <ConfigProvider theme={antdTheme}>
          {children}
        </ConfigProvider>
      </PersistorContext.Provider>
    </Provider>
  );
}
