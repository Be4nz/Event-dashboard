import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, styled } from '@mui/material';
import { ImageFromInitials } from './InitialsLogo';
import { Participant } from '../types/participation';
import * as Grid from '@mui/x-data-grid';
import { formatTimeString } from '../utils/dateUtils';
import { CustomNoRowsOverlay } from './styled/NoRowsOverlay';
import { getParticipationsByEvent } from '../api/participation';
import { Event } from '../types/event';
import { getUserInfoFromOid } from '../api/users';
import { useUserRole } from './UserRolesProvider';
import * as MsalTypes from '@azure/msal-browser';

const Loading = styled(CircularProgress)`
  margin: 0;
  position: relative;
  top: 50%;
  left: 50%;
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  font-weight: bold;
  text-align: center;
`;

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
  { field: 'notes', headerName: 'Notes', width: 200 },
];

const appointColumns: Grid.GridColDef[] = [
  ...columns,
  {
    field: 'appointmentTime',
    headerName: 'Appointment Time',
    width: 200,
    renderCell: (params) => {
      return formatTimeString(params.row.appointmentTime);
    },
  },
];

const ParticipantDataGrid = styled(Grid.DataGrid)`
  &.MuiDataGrid-root .MuiDataGrid-cell:focus-within {
    outline: none !important;
  }
  .MuiDataGrid-columnHeader {
    outline: none !important;
  }
`;

const ParticipantsBox = styled(Box)`
  width: 100%;
`;

const ListContainer = styled('div')`
  margin-left: 20px;
  margin-bottom: 20px;
  width: 50%;
`;

const TitleText = styled(Typography)`
  font-size: 1.1rem;
  font-weight: 500;
  width: 100%;
`;

export default function ParticipantList({
  event,
  currentUser,
}: {
  event: Event;
  currentUser: MsalTypes.AccountInfo | undefined;
}) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingParticipants, setLoadingParticipants] =
    useState<boolean>(false);
  const [rowCount, setRowCount] = useState<number>(0);
  const [selectedColumns, setSelectedColumns] = useState<
    Grid.GridColDef<any, any, any>[]
  >([]);
  const { isAdmin } = useUserRole();
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 5,
  });

  useEffect(() => {
    setLoadingParticipants(true);

    const offset = pagination.page * pagination.pageSize;
    const limit = pagination.pageSize;
    if (isAdmin || currentUser?.localAccountId === event.createdBy) {
      getParticipationsByEvent(String(event?.id), offset, limit).then(
        (participants) => {
          setRowCount(participants.pagination.total);
          const promises = participants.participantList.map(
            async (participant: Participant) => {
              const userInfo = await getUserInfoFromOid(participant.userId);
              participant.firstName = userInfo.givenName;
              participant.lastName = userInfo.surname;
              participant.displayName = userInfo.displayName;
              return participant;
            },
          );

          Promise.all(promises).then((updatedParticipants) => {
            setParticipants(updatedParticipants);
            setLoadingParticipants(false);
          });
          const hasAppointmentTime = participants.participantList.some(
            (participant: Participant) => participant.appointmentTime,
          );
          hasAppointmentTime
            ? setSelectedColumns(appointColumns)
            : setSelectedColumns(columns);
        },
      );
    } else {
      setLoadingParticipants(false);
    }
  }, [pagination]);

  return (
    <ListContainer>
      <TitleText>Participant list </TitleText>
      {!loadingParticipants ? (
        <ParticipantsBox>
          <ParticipantDataGrid
            components={{
              NoRowsOverlay: CustomNoRowsOverlay,
            }}
            rows={participants}
            columns={selectedColumns}
            pagination
            pageSizeOptions={[5, 10, 25]}
            paginationModel={pagination}
            onPaginationModelChange={setPagination}
            paginationMode='server'
            rowCount={rowCount}
            sortingOrder={['desc', 'asc']}
            disableRowSelectionOnClick
            autoHeight
          />
        </ParticipantsBox>
      ) : (
        <>
          <Loading />
        </>
      )}
    </ListContainer>
  );
}
