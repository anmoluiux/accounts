import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import onboardingReducer from "./onboardingSlice";

const persistConfig = {
  key: "onboarding-storage",
  storage,
  //   whitelist: ["onboarding"], // Only persist the onboarding slice
};

const persistedReducer = persistReducer(persistConfig, onboardingReducer);

export const makeStore = () => {
  return configureStore({
    reducer: {
      onboarding: persistedReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false, // Required for Redux Persist
      }),
  });
};

// Types for TypeScript
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
