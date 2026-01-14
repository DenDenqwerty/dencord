import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../axios';

export const fetchServerDetails = createAsyncThunk('channels/fetchServerDetails', async (id: string) => {
  const { data } = await axios.get(`/servers/${id}`);
  return data;
});

export const fetchMessages = createAsyncThunk('channels/fetchMessages', async (channelId: string) => {
  const { data } = await axios.get(`/channels/${channelId}/messages`);
  return data;
});

export const createChannel = createAsyncThunk('channels/createChannel', async ({ name, type, serverId }: { name: string, type: string, serverId: string }) => {
  const { data } = await axios.post('/channels', { name, type, serverId });
  return data;
});

const initialState = {
  currentServer: null,
  activeVoiceChannel: null,
  messages: [],
  status: 'loading',
};

const channelSlice = createSlice({
  name: 'channels',
  initialState,
  reducers: {
    setActiveVoiceChannel: (state, action) => {
      state.activeVoiceChannel = action.payload;
    },
    addMessage: (state, action) => {
      (state.messages as any).push(action.payload);
    },
    updateMessageReaction: (state, action) => {
      const { messageId, emoji, userId } = action.payload;
      const message = (state.messages as any).find((m: any) => m._id === messageId);
      if (message) {
        if (!message.reactions) message.reactions = {};
        if (!message.reactions[emoji]) message.reactions[emoji] = [];
        if (!message.reactions[emoji].includes(userId)) {
          message.reactions[emoji].push(userId);
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServerDetails.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchServerDetails.fulfilled, (state, action) => {
        state.status = 'loaded';
        state.currentServer = action.payload;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages = action.payload;
      })
      .addCase(createChannel.fulfilled, (state, action) => {
        if (state.currentServer) {
          (state.currentServer as any).channels.push(action.payload);
        }
      });
  },
});

export const { setActiveVoiceChannel, addMessage, updateMessageReaction } = channelSlice.actions;
export const channelReducer = channelSlice.reducer;
