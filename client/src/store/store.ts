import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './slices/auth';
import { serverReducer } from './slices/server';
import { channelReducer } from './slices/channel';
import { friendsReducer } from './slices/friends';

const store = configureStore({
  reducer: {
    auth: authReducer,
    servers: serverReducer,
    channels: channelReducer,
    friends: friendsReducer,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
