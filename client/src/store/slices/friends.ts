import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../axios';

export const fetchFriends = createAsyncThunk('friends/fetchFriends', async () => {
  const { data } = await axios.get('/friends');
  return data;
});

export const fetchFriendRequests = createAsyncThunk('friends/fetchFriendRequests', async () => {
  const { data } = await axios.get('/friends/requests');
  return data;
});

export const sendFriendRequest = createAsyncThunk('friends/sendRequest', async (username: string) => {
  const { data } = await axios.post('/friends/request', { username });
  return data;
});

export const respondToRequest = createAsyncThunk('friends/respondToRequest', async ({ requestId, status }: { requestId: string, status: 'accepted' | 'rejected' }) => {
  const { data } = await axios.put('/friends/respond', { requestId, status });
  return { requestId, status, data };
});

const initialState = {
  friends: [],
  requests: [],
  status: 'idle',
};

const friendsSlice = createSlice({
  name: 'friends',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFriends.fulfilled, (state, action) => {
        state.friends = action.payload;
      })
      .addCase(fetchFriendRequests.fulfilled, (state, action) => {
        state.requests = action.payload;
      })
      .addCase(respondToRequest.fulfilled, (state, action) => {
        state.requests = state.requests.filter((req: any) => req._id !== action.payload.requestId);
        if (action.payload.status === 'accepted') {
          // We should ideally re-fetch friends, but for now let's just rely on the next fetch
        }
      });
  },
});

export const friendsReducer = friendsSlice.reducer;
