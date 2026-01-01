import { configureStore } from '@reduxjs/toolkit';
import vendorsReducer from './vendorsSlice';
import clientsReducer from './clientsSlice';
import versionsReducer from './versionsSlice';

// Configure Redux store with all slices
export const store = configureStore({
  reducer: {
    vendors: vendorsReducer,
    clients: clientsReducer,
    versions: versionsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Export types for TypeScript support
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
