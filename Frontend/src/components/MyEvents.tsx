import React from 'react';
import { searchMyEvents } from '../api/events';
import EventList from '../pages/EventList';

export const MyEvents = () => {
  return <EventList eventsFetcher={searchMyEvents} />;
};
