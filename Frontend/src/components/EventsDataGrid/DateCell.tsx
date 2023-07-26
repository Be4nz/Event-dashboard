import React from 'react';
import { TopLine, BottomLine, LineContainer } from './CellStyles';
import { formatDate, formatTime } from '../../utils/dateUtils';

export const DateCell = ({ dateString }: { dateString: string }) => {
  const date = new Date(dateString);

  const dateStr = formatDate(date);

  const timeStr = formatTime(date);

  return (
    <LineContainer>
      {dateString !== null ? (
        <>
          <TopLine>{dateStr}</TopLine>
          <BottomLine>{timeStr}</BottomLine>
        </>
      ) : null}
    </LineContainer>
  );
};
