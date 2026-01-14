import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../axios';

export const fetchServers = createAsyncThunk('servers/fetchServers', async () => {
  const { data } = await axios.get('/servers');
  return data;
});

export const createServer = createAsyncThunk('servers/createServer', async (name: string) => {
  const { data } = await axios.post('/servers', { name });
  return data;
});

const initialState = {
  servers: [],
  status: 'loading',
};

const serverSlice = createSlice({
  name: 'servers',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchServers.fulfilled, (state, action) => {
        state.status = 'loaded';
        state.servers = action.payload;
      })
      .addCase(fetchServers.rejected, (state) => {
        state.status = 'error';
        state.servers = [];
      })
      .addCase(createServer.fulfilled, (state, action: any) => {
        (state.servers as any).push(action.payload);
      });
  },
});

export const serverReducer = serverSlice.reducer;
