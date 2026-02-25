"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "./store";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import { ConfigProvider, theme } from "antd";

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  const persistorRef = useRef<any>(null);

  if (!storeRef.current) {
    storeRef.current = makeStore();
    persistorRef.current = persistStore(storeRef.current);
  }

  return (
    <Provider store={storeRef.current}>
      <PersistGate loading={null} persistor={persistorRef.current}>
        <ConfigProvider
          theme={{
            algorithm: theme.defaultAlgorithm, // light theme
            token: {
              colorPrimary: "#000000", // BLACK primary color
            },
          }}>
          {children}
        </ConfigProvider>
      </PersistGate>
    </Provider>
  );
}
