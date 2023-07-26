import React, { useState } from 'react';
import * as Grid from '@mui/x-data-grid';
import { styled, Typography } from '@mui/material';
import { ImageFromInitials } from './InitialsLogo';
import { ShareListProp, User, UserGroup } from '../types/user';
import { GridBox } from './EventsDataGrid/CellStyles';

const ShareDataGrid = styled(Grid.DataGrid)`
  &.MuiDataGrid-root .MuiDataGrid-cell:focus-within {
    outline: none !important;
  }
  background-color: #f5f5f5;
`;

const Text = styled(Typography)`
  font-size: 1rem;
  font-weight: 500;
`;

const SelectText = styled(Typography)`
  margin-left: 18%;
  width: 550px;
`;

const columns: Grid.GridColDef[] = [
  {
    field: 'displayName',
    headerName: 'User',
    width: 400,
    renderCell: (params) => {
      return (
        <>
          <ImageFromInitials size={35} name={params.row.displayName} />
          <Text>{params.row.displayName}</Text>
        </>
      );
    },
  },
];

export default function ShareList({
  data,
  setSharedUsers,
}: {
  data: ShareListProp[];
  setSharedUsers: React.Dispatch<React.SetStateAction<User[]>>;
}) {
  const [selected, setSelected] = useState<ShareListProp[]>([]);

  const onRowsSelectionHandler = (ids: Grid.GridRowId[]) => {
    const selectedRowsData = ids
      .map((id) => data.find((item: ShareListProp) => item.id == id))
      .filter((item): item is ShareListProp => item !== undefined);

    setSelected(selectedRowsData);

    function isUserGroup(data: ShareListProp) {
      return (data as UserGroup).users !== undefined;
    }

    const sharedUsers: User[] = selectedRowsData.reduce(
      (acc: User[], item: ShareListProp) => {
        if (item) {
          const data = item;
          if (isUserGroup(data)) {
            const users = (data as UserGroup).users;
            users.forEach((user) => {
              if (!acc.some((existingUser) => existingUser.id === user.id)) {
                acc.push(user);
              }
            });
          } else {
            if (!acc.some((existingUser) => existingUser.id === data.id)) {
              acc.push(data);
            }
          }
        }
        return acc;
      },
      [],
    );
    setSharedUsers(sharedUsers);
  };

  return (
    <>
      <GridBox>
        <ShareDataGrid
          rows={data}
          columns={columns}
          checkboxSelection
          initialState={{
            pagination: { paginationModel: { pageSize: 5 } },
          }}
          pagination
          pageSizeOptions={[5, 10, 25]}
          sortingOrder={['desc', 'asc']}
          onRowSelectionModelChange={(ids) => onRowsSelectionHandler(ids)}
        />
      </GridBox>
      <SelectText>
        Selected: {selected.map((item) => item?.displayName).join(', ')}
      </SelectText>
    </>
  );
}
