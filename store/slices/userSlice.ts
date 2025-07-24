import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  is_active?: boolean;
  subscription?: {
    status: 'active' | 'pastDue';
    tier: string; // 'trial', 'basic', etc.
    starts_at: string; // ISO string
    ends_at: string; // ISO string
    billing_cycle?: string;
    is_scheduled_for_cancellation?: boolean;
  };
  plan?: {
    name: string;
    price: number;
    currency: string;
    features: string[];
    description: string;
    plan_id?: number;
  };
  plan_id?: number | null;
  currentBillingType?: 'monthly' | 'yearly';
  isScheduledForCancellation?: boolean;
}
// Selectors for subscription logic
import { RootState } from '../store';

export const selectUserInfo = (state: RootState) => state.user.info;
export const selectUserPlanId = (state: RootState) => state.user.info?.plan?.plan_id ?? null;
export const selectUserBillingType = (state: RootState) => state.user.info?.subscription?.billing_cycle ?? null;
export const selectSubscription = (state: RootState) => state.user.info?.subscription;
export const selectSubscriptionTier = (state: RootState) => state.user.info?.subscription?.tier;
export const selectSubscriptionEndsAt = (state: RootState) => state.user.info?.subscription?.ends_at;
export const selectSubscriptionStartsAt = (state: RootState) => state.user.info?.subscription?.starts_at;

interface UserState {
  info: UserInfo | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  plan_id?: number | null;
  currentBillingType?: 'monthly' | 'yearly';
  isScheduledForCancellation?: boolean;
}

const initialState: UserState = {
  info: null,
  status: 'idle',
  error: null,
  plan_id: null,
  currentBillingType: undefined,
  isScheduledForCancellation: undefined,
};

export const fetchUser = createAsyncThunk<UserInfo, void, { rejectValue: string }>(
  'user/fetchUser',
  async (_, { rejectWithValue }) => {
    const token = Cookies.get('access_token');
    if (!token) return rejectWithValue('No access token');
    const response = await fetch('http://localhost:8000/users/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return rejectWithValue(error.detail || 'Failed to fetch user');
    }
    return response.json();
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout(state) {
      state.info = null;
      state.status = 'idle';
      state.error = null;
      state.plan_id = null;
      state.currentBillingType = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.info = action.payload;
        state.plan_id = action.payload.plan_id ?? action.payload.plan?.plan_id ?? null;
        // Derive currentBillingType from subscription.billing_cycle
        const billing = action.payload.subscription?.billing_cycle;
        if (billing === 'month') state.currentBillingType = 'monthly';
        else if (billing === 'year') state.currentBillingType = 'yearly';
        else state.currentBillingType = undefined;
        // Set isScheduledForCancellation from subscription
        state.isScheduledForCancellation = !!action.payload.subscription?.is_scheduled_for_cancellation;
        if (state.info) {
          state.info.isScheduledForCancellation = !!action.payload.subscription?.is_scheduled_for_cancellation;
        }
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch user';
      });
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer; 