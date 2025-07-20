import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  plan: string;
  // Add more fields as needed
}

interface UserState {
  info: UserInfo | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: UserState = {
  info: null,
  status: 'idle',
  error: null,
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
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch user';
      });
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer; 