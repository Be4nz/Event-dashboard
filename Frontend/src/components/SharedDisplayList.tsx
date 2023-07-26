import React from 'react';
import { Box, Typography, styled } from '@mui/material';
import * as Grid from '@mui/x-data-grid';
import { User } from '../types/user';
import { ImageFromInitials } from './InitialsLogo';
import { CustomNoRowsOverlay } from './styled/NoRowsOverlay';

const columns: Grid.GridColDef[] = [
  {
    field: 'displayName',
    headerName: 'User',
    width: 200,
    renderCell: (params) => {
      return (
        <>
          {' '}
          <ImageFromInitials size={35} name={params.row.displayName} />{' '}
          {params.row.displayName}{' '}
        </>
      );
    },
  },
];

const ShareDataGrid = styled(Grid.DataGrid)`
  &.MuiDataGrid-root .MuiDataGrid-cell:focus-within {
    outline: none !important;
  }
  .MuiDataGrid-columnHeader {
    outline: none !important;
  }
`;

const ShareBox = styled(Box)`
  width: 100%;
`;

const ListContainer = styled('div')`
  margin-left: 20px;
  margin-right: 20px;
  margin-bottom: 20px;
  width: 50%;
`;

const TitleText = styled(Typography)`
  font-size: 1.1rem;
  font-weight: 500;
  width: 100%;
`;

export default function SharedDisplayList({ users }: { users: User[] }) {
  return (
    <ListContainer>
      <TitleText>Shared with</TitleText>
      <ShareBox>
        <ShareDataGrid
          components={{
            NoRowsOverlay: CustomNoRowsOverlay,
          }}
          rows={users}
          columns={columns}
          initialState={{
            pagination: { paginationModel: { pageSize: 5 } },
          }}
          pagination
          pageSizeOptions={[5, 10, 25]}
          sortingOrder={['desc', 'asc']}
          disableRowSelectionOnClick
          autoHeight
        />
      </ShareBox>
    </ListContainer>
  );
}
