import { configureStore } from '@reduxjs/toolkit';
import filterReducer from './components/filter/filterSlice';

export const store = configureStore({
  reducer: {
    filter: filterReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
