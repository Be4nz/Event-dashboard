import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { EventFilters, initialFilters } from '../../types/event';
import { Pagination } from '../../types/pagination';

export interface FilterState {
  filters: EventFilters;
  eventCount: number;
}

const initialState: FilterState = {
  filters: initialFilters,
  eventCount: 0,
};

export const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<EventFilters>) => {
      state.filters = action.payload;
    },
    setEventCount: (state, action: PayloadAction<Pagination>) => {
      state.eventCount = action.payload.total;
    },
  },
});

export const { setFilters, setEventCount } = filterSlice.actions;

export default filterSlice.reducer;
