import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { URL } from "@/src/assets/url";

var _ = require("lodash");

// 1. Define the State Interface
interface OnboardingState {
  currentStep: number;
  customer_id: string | null;
  lead_id: string | null; // Stores the database ID once created
  stepData: {
    // Step 1: Prompt
    siteName?: string;
    businessName?: string;
    siteType?: string; // e.g. 'fashion', 'restaurant'

    // Step 2: Vibe
    siteVibe?: string; // e.g. 'bold', 'minimal'

    // Step 3: Details
    description?: string;
    features?: string[];
    userId?: string;
    siteId?: string;
    email?: string;
    phone?: string;
  };

  users: {
    [key: string]: {
      customer: any;
      site: any;
      status: any;
    };
  };
  isLoading: boolean;
  error: string | null;
}

// 2. Initial State
const initialState: OnboardingState = {
  currentStep: 0,
  customer_id: null,
  lead_id: null,
  stepData: {
    siteName: "",
    businessName: "",
    siteType: "online_store",
    features: [],
  },
  users: {},
  isLoading: false,
  error: null,
};

// 3. Async Thunk: Save to Database (API)
export const saveProgress = createAsyncThunk("onboarding/saveProgress", async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState() as { onboarding: OnboardingState };
    const { lead_id, stepData } = state.onboarding;

    const res = await fetch(URL.ONBOARD_LEAD, {
      method: "POST", // Laravel upsert handles both creation and update
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        id: lead_id,
        ...stepData
      }),
    });


    const result = await res.json();

    console.log("RESSULT >>>>>", result);
    // 3. Handle the new standardized "envelope" { status, data, message }
    if (!res.ok || result.status === 'error') {
      throw new Error(result.message || "Failed to save progress");
    }

    return result.data;



    // FOR POSTGRESS :: ABANDONED
    // FOR POSTGRESS
    // // Logic: If we have an ID, update it (PATCH). If not, create new (POST).
    // const method = leadId ? "PATCH" : "POST";

    // // Payload: If updating, we need to send the leadId in the body
    // const payload = leadId ? { leadId, ...stepData } : stepData;

    // console.log("Saving progress with payload:", payload);
    // const response = await fetch("/api/leads", {
    //   method,
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(payload),
    // });

    // if (!response.ok) {
    //   throw new Error("Failed to save progress");
    // }

    // const data = await response.json();
    // return data; // Expected return: { success: true, leadId: "..." }
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

// 4. The Slice
export const onboardingSlice = createSlice({
  name: "onboarding",
  initialState,
  reducers: {
    // Standard Reducers
    setStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    setLeadId: (state, action: PayloadAction<string>) => {
      state.lead_id = action.payload;
    },
    updateFormData: (state, action: PayloadAction<Partial<OnboardingState["stepData"]>>) => {
      // Merges new data with existing data
      state.stepData = { ...state.stepData, ...action.payload };
    },
    setBoardState: (state, action) => {
      const { name, data } = action.payload;
      _.set(state, name, data);
    },
    setBoardMerge: (state, action) => {
      const { name, data } = action.payload;

      if (!name.includes(".")) {
        (state as any)[name] = (state as any)[name] ? { ...(state as any)[name], ...data } : { ...data };
      } else {
        const existingValue = _.get(state, name);
        if (_.isPlainObject(existingValue) && _.isPlainObject(data)) {
          _.set(state, name, { ...existingValue, ...data });
        } else {
          _.set(state, name, data);
        }
      }
    },
    resetOnboarding: () => initialState,
    resetStepData: (state) => {
      state.lead_id     = null;
      state.customer_id = null;
      state.currentStep = 0;
      state.stepData    = initialState.stepData;
    },
  },

  // Handle Async API Responses
  extraReducers: (builder) => {
    builder
      .addCase(saveProgress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveProgress.fulfilled, (state, action) => {
        state.isLoading = false;
        console.log("action.payload >>>>>", action.payload)
        // If the API returned a new lead_id (on first creation), save it
        if (action.payload.lead_id) {
          state.lead_id = action.payload.lead_id;
        }
      })
      .addCase(saveProgress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// 5. Exports
export const { setStep, setLeadId, updateFormData, resetOnboarding, setBoardState, setBoardMerge, resetStepData } = onboardingSlice.actions;
export default onboardingSlice.reducer;
