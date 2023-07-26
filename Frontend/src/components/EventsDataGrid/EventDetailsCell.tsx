import React from 'react';
import { styled } from '@mui/material';
import { Event } from '../../types/event';
import { TopLine, BottomLine, LineContainer } from './CellStyles';

const EventImage = styled('img')`
  height: 90px;
  width: 120px;
  object-fit: cover;
`;

const CellContainer = styled('div')`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TextContainer = styled('div')`
  width: 200px;
  margin-right: 30px;
`;

const shortenString = (line: string) => {
  return line && line.length > 20 ? line?.substring(0, 20) + '...' : line;
};

export const EventDetailsCell = ({
  row,
  imageSrc,
}: {
  row: Event;
  imageSrc: string;
}) => {
  return (
    <CellContainer>
      <TextContainer>
        <LineContainer>
          <TopLine>{shortenString(row.title)}</TopLine>
          {row.description && (
            <BottomLine>{shortenString(row.description)}</BottomLine>
          )}
        </LineContainer>
      </TextContainer>
      {imageSrc && <EventImage src={imageSrc} />}
    </CellContainer>
  );
};
