// src/store/serviceStatus.js
import { createSlice, configureStore } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'services',
  initialState: { auth: false, billing: false, notifications: false, analytics: false },
  reducers: {
    updateStatus(state, action) {
      const { service, up } = action.payload;
      state[service] = !!up;
    }
  }
});

export const { updateStatus } = slice.actions;

export const store = configureStore({ reducer: slice.reducer });
