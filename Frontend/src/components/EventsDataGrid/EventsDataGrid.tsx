import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Direction, Event } from '../../types/event';
import { getImage } from '../../api/events';
import { Buffer } from 'buffer';
import { setFilters } from '../filter/filterSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { EventDetailsCell } from './EventDetailsCell';
import { DateCell } from './DateCell';
import { useNavigate } from 'react-router-dom';
import { TypeCell } from './TypeCell';
import { EventDataGrid, GridBox } from './CellStyles';
import * as Grid from '@mui/x-data-grid';
import { useUserRole } from '../UserRolesProvider';

const EventsDataGrid = ({
  events,
  rowSelectionModel,
  setRowSelectionModel,
}: {
  events: Event[];
  rowSelectionModel: Grid.GridRowSelectionModel;
  setRowSelectionModel: Dispatch<SetStateAction<Grid.GridRowSelectionModel>>;
}) => {
  const [eventImages, setEventImages] = useState<Record<string, string>>({});

  const filters = useSelector((state: RootState) => state.filter.filters);
  const eventCount = useSelector((state: RootState) => state.filter.eventCount);

  const [paginationModel, setPaginationModel] = useState({
    page: filters.offset / filters.limit,
    pageSize: 10,
  });

  const [sortModel, setSortModel] = useState<Grid.GridSortModel>([
    {
      field: 'eventDate',
      sort: 'desc' as Grid.GridSortDirection,
    },
  ]);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAdmin } = useUserRole();

  useEffect(() => {
    dispatch(
      setFilters({
        ...filters,
        offset: paginationModel.page * paginationModel.pageSize,
        limit: paginationModel.pageSize,
        sortDirection: sortModel[0].sort
          ?.toString()
          .toLocaleUpperCase() as Direction,
        sortField: sortModel[0].field,
      }),
    );
  }, [paginationModel, sortModel]);

  useEffect(() => {
    const fetchImages = async () => {
      const images: Record<string, string> = {};
      for (const event of events) {
        if (event && event.imageUrl) {
          const response = await getImage(event.imageUrl);
          const base64String = `data:image/png;base64,${Buffer.from(
            response,
            'binary',
          ).toString('base64')}`;
          images[event.id] = base64String;
        }
      }
      setEventImages(images);
    };

    fetchImages();
  }, [events]);

  const cellWidth = 390;

  const handleRowClick = (params: Grid.GridRowParams) => {
    navigate(`/events/${params.row.id}`);
  };

  const columns: Grid.GridColDef[] = [
    {
      field: 'title',
      headerName: 'Event details',
      width: cellWidth,
      renderCell: (params) => {
        return (
          <EventDetailsCell
            row={params.row}
            imageSrc={eventImages[params.row.id]}
          />
        );
      },
    },
    {
      field: 'type',
      headerName: 'Event type',
      width: cellWidth,
      editable: true,
      renderCell: (params) => {
        return <TypeCell row={params.row} />;
      },
    },
    {
      field: 'eventDate',
      headerName: 'Date',
      width: cellWidth,
      editable: true,
      renderCell: (params) => {
        return <DateCell dateString={params.row.eventDate} />;
      },
    },
    {
      field: 'registrationDeadline',
      headerName: 'Registration Deadline',
      width: cellWidth,
      editable: true,
      renderCell: (params) => {
        return <DateCell dateString={params.row.registrationDeadline} />;
      },
    },
  ];

  return (
    <GridBox>
      <EventDataGrid
        checkboxSelection={isAdmin}
        onRowSelectionModelChange={(newRowSelectionModel) => {
          setRowSelectionModel(newRowSelectionModel);
        }}
        rowSelectionModel={rowSelectionModel}
        rows={events}
        columns={columns}
        getRowHeight={() => 100}
        pagination
        paginationModel={paginationModel}
        pageSizeOptions={[10, 20, 50]}
        rowCount={eventCount}
        paginationMode='server'
        onPaginationModelChange={setPaginationModel}
        disableRowSelectionOnClick
        onRowClick={handleRowClick}
        sortingMode='server'
        sortModel={sortModel}
        onSortModelChange={setSortModel}
        sortingOrder={['desc', 'asc']}
        autoHeight
      />
    </GridBox>
  );
};

export default EventsDataGrid;
