import React from 'react';
import { EventSubtype, EventType, Event, eventTypes } from '../../types/event';
import { TopLine, BottomLine, LineContainer } from './CellStyles';

export const TypeCell = ({ row }: { row: Event }) => {
  const eventSubtypeIndex = Object.values(EventSubtype).indexOf(
    row.subtype as EventSubtype,
  );

  const eventTypeObject = eventTypes.find(
    (eventType) => eventType.value === (row.type as EventType),
  );

  return (
    <>
      <LineContainer>
        <TopLine>{eventTypeObject?.label}</TopLine>
        <BottomLine>{Object.keys(EventSubtype)[eventSubtypeIndex]}</BottomLine>
      </LineContainer>
    </>
  );
};
