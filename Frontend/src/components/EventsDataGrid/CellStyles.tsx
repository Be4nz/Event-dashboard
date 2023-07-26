import { Box, Typography, styled } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

export const TopLine = styled(Typography)`
  font-size: 1rem;
  font-weight: 600;
  margin: 0px;
  color: rgb(60, 60, 60);
`;
export const LineContainer = styled('div')`
  display: flex;
  flex-direction: column;
`;

export const BottomLine = styled(Typography)`
  color: rgb(179, 182, 196);
  margin: 0px;
`;

export const GridBox = styled(Box)`
  height: 100%;
  margin: 20px 150px;
  background-color: white;
  cursor: pointer;

  .MuiDataGrid-columnHeader {
    outline: none !important;
  }
`;

export const EventDataGrid = styled(DataGrid)`
  &.MuiDataGrid-root .MuiDataGrid-cell:focus-within {
    outline: none !important;
  }
`;
