import React from 'react';
import {
  BottomLine,
  LineContainer,
  TopLine,
} from './EventsDataGrid/CellStyles';

const DetailsCell = ({ main, sub }: { main: string; sub?: string }) => {
  return (
    <LineContainer>
      {main !== null ? (
        <>
          <TopLine>{main}</TopLine>
          <BottomLine>{sub}</BottomLine>
        </>
      ) : null}
    </LineContainer>
  );
};
export default DetailsCell;
