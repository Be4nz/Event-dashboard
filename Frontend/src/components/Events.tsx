import React from 'react';
import { searchEvents } from '../api/events';
import EventList from '../pages/EventList';

export const Events = () => {
  return <EventList eventsFetcher={searchEvents} />;
};
