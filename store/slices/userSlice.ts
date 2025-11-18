import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

// Generic types for flexible backend integration
export type GenericObject = Record<string, any>;
export type GenericArray = any[];

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  is_active?: boolean;
  subscription?: {
    status: string; // Made generic instead of union type
    tier: string;
    starts_at: string;
    ends_at: string;
    billing_cycle?: string;
    is_scheduled_for_cancellation?: boolean;
    past_due?: boolean;
    [key: string]: any; // Allow additional subscription properties
  };
  plan?: {
    name: string;
    price: number;
    currency: string;
    features: GenericObject; // Changed from string[] to object for nested structure
    description: string;
    plan_id?: string | number; // Made flexible to handle string IDs
    flags?: GenericObject; // Added flags object
    [key: string]: any; // Allow additional plan properties
  };
  limits?: {
    project?: { used: number; limit: number };
    agent?: { used: number; limit: number };
    credits?: { used: number; limit: number };
    [key: string]: { used: number; limit: number } | undefined; // Allow additional limit types
  };
  credit_cost?: {
    competitor_analysis?: number;
    reddit_post_generation?: number;
    [key: string]: number | undefined;
  };
  plan_id?: string | number | null; // Made flexible
  currentBillingType?: "monthly" | "yearly";
  isScheduledForCancellation?: boolean;
  [key: string]: any; // Allow additional root-level properties from backend
}
// Selectors for subscription logic
import { RootState } from "../store";
import { getApiUrl } from "../../lib/config";

// Type-safe selectors with fallback handling
export const selectUserInfo = (state: RootState) => state.user.info;
export const selectUserPlanId = (state: RootState): string | number | null => {
  const userInfo = state.user.info;
  if (!userInfo) return null;
  // Try multiple sources for plan_id
  return userInfo.plan_id ?? userInfo.plan?.plan_id ?? null;
};
export const selectUserBillingType = (state: RootState) =>
  state.user.info?.subscription?.billing_cycle ?? null;
export const selectSubscription = (state: RootState) =>
  state.user.info?.subscription;
export const selectSubscriptionTier = (state: RootState) =>
  state.user.info?.subscription?.tier;
export const selectSubscriptionEndsAt = (state: RootState) =>
  state.user.info?.subscription?.ends_at;
export const selectSubscriptionStartsAt = (state: RootState) =>
  state.user.info?.subscription?.starts_at;

// New selectors for limits and features
export const selectUserLimits = (state: RootState) => state.user.info?.limits;
export const selectProjectLimit = (state: RootState) =>
  state.user.info?.limits?.project;
export const selectAgentLimit = (state: RootState) =>
  state.user.info?.limits?.agent;
export const selectCreditsLimit = (state: RootState) =>
  state.user.info?.limits?.credits;
export const selectPlanFeatures = (state: RootState) =>
  state.user.info?.plan?.features;
export const selectPlanFlags = (state: RootState) =>
  state.user.info?.plan?.flags;
export const selectPlanName = (state: RootState) =>
  state.user.info?.plan?.name ?? "Free";

// Utility selectors for common checks
export const selectIsSubscriptionActive = (state: RootState) =>
  state.user.info?.subscription?.status === "active";
export const selectIsSubscriptionPastDue = (state: RootState) =>
  state.user.info?.subscription?.past_due === true;
export const selectIsScheduledForCancellation = (state: RootState) =>
  state.user.info?.subscription?.is_scheduled_for_cancellation === true;

// Type-safe utility functions for accessing generic properties
export const getPlanFeature = (state: RootState, featureKey: string): any => {
  const features = state.user.info?.plan?.features;
  if (!features || typeof features !== "object") return undefined;
  return (features as GenericObject)[featureKey];
};

export const getLimitValue = (
  state: RootState,
  limitType: string
): { used: number; limit: number } | undefined => {
  const limits = state.user.info?.limits;
  if (!limits || typeof limits !== "object") return undefined;
  return (limits as GenericObject)[limitType] as
    | { used: number; limit: number }
    | undefined;
};

export const getPlanFlag = (state: RootState, flagKey: string): any => {
  const flags = state.user.info?.plan?.flags;
  if (!flags || typeof flags !== "object") return undefined;
  return (flags as GenericObject)[flagKey];
};

// Convenience selectors using the utility functions
export const selectProjectLimitUsed = (state: RootState): number =>
  getLimitValue(state, "project")?.used ?? 0;
export const selectProjectLimitTotal = (state: RootState): number =>
  getLimitValue(state, "project")?.limit ?? 0;
export const selectAgentLimitUsed = (state: RootState): number =>
  getLimitValue(state, "agent")?.used ?? 0;
export const selectAgentLimitTotal = (state: RootState): number =>
  getLimitValue(state, "agent")?.limit ?? 0;
export const selectCreditsLimitUsed = (state: RootState): number =>
  getLimitValue(state, "credits")?.used ?? 0;
export const selectCreditsLimitTotal = (state: RootState): number =>
  getLimitValue(state, "credits")?.limit ?? 0;

// Credit cost selectors
export const selectCompetitorAnalysisCost = (state: RootState): number =>
  state.user.info?.credit_cost?.competitor_analysis ?? 0;

export const selectRedditPostGenerationCost = (state: RootState): number =>
  state.user.info?.credit_cost?.reddit_post_generation ?? 0;

// Credit availability checkers
export const selectHasEnoughCreditsForCompetitorAnalysis = (
  state: RootState
): boolean => {
  const used = selectCreditsLimitUsed(state);
  const limit = selectCreditsLimitTotal(state);
  const cost = selectCompetitorAnalysisCost(state);
  const available = limit - used;
  return available >= cost;
};

export const selectHasEnoughCreditsForRedditPostGeneration = (
  state: RootState
): boolean => {
  const used = selectCreditsLimitUsed(state);
  const limit = selectCreditsLimitTotal(state);
  const cost = selectRedditPostGenerationCost(state);
  const available = limit - used;
  return available >= cost;
};

// Generic credit checker
export const selectHasEnoughCredits = (
  state: RootState,
  cost: number
): boolean => {
  const used = selectCreditsLimitUsed(state);
  const limit = selectCreditsLimitTotal(state);
  const available = limit - used;
  return available >= cost;
};

// Get remaining credits
export const selectRemainingCredits = (state: RootState): number => {
  const used = selectCreditsLimitUsed(state);
  const limit = selectCreditsLimitTotal(state);
  return Math.max(0, limit - used);
};

interface UserState {
  info: UserInfo | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  plan_id?: string | number | null;
  currentBillingType?: "monthly" | "yearly";
  isScheduledForCancellation?: boolean;
}

const initialState: UserState = {
  info: null,
  status: "idle",
  error: null,
  plan_id: null,
  currentBillingType: undefined,
  isScheduledForCancellation: undefined,
};

export const fetchUser = createAsyncThunk<
  UserInfo,
  void,
  { rejectValue: string }
>("user/fetchUser", async (_, { rejectWithValue }) => {
  const token = Cookies.get("access_token");
  if (!token) return rejectWithValue("No access token");
  const response = await fetch(getApiUrl("users/me"), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    return rejectWithValue(error.detail || "Failed to fetch user");
  }
  return response.json();
});

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout(state) {
      state.info = null;
      state.status = "idle";
      state.error = null;
      state.plan_id = null;
      state.currentBillingType = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.info = action.payload;
        // Handle both string and number plan_ids flexibly
        const planId =
          action.payload.plan_id ?? action.payload.plan?.plan_id ?? null;
        state.plan_id = typeof planId === "string" ? planId : planId;

        // Derive currentBillingType from subscription.billing_cycle
        const billing = action.payload.subscription?.billing_cycle;
        if (billing === "month") state.currentBillingType = "monthly";
        else if (billing === "year") state.currentBillingType = "yearly";
        else state.currentBillingType = undefined;

        // Set isScheduledForCancellation from subscription
        state.isScheduledForCancellation =
          !!action.payload.subscription?.is_scheduled_for_cancellation;
        if (state.info) {
          state.info.isScheduledForCancellation =
            !!action.payload.subscription?.is_scheduled_for_cancellation;
        }
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to fetch user";
      });
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;
