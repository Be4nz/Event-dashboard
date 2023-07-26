import React, { useEffect, useState } from 'react';
import { exportEventsToExcel } from '../api/events';
import { Event, EventFilters, initialFilters } from '../types/event';
import EventFilter from '../components/filter/EventFilter';
import LoadingWrapper from '../components/LoadingWrapper';
import { useNavigate } from 'react-router-dom';
import 'dayjs/locale/en-gb';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setEventCount, setFilters } from '../components/filter/filterSlice';
import Message from '../components/styled/Message';
import {
  FilterBarButton,
  ShowPreviousSwitch,
  SwitchButton,
  FilterBarButtons,
} from '../components/styled/FilterBarButtons';
import styled from '@mui/material/styles/styled';
import EventsDataGrid from '../components/EventsDataGrid/EventsDataGrid';
import { Container, ListContainer } from '../components/styled/Containers';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useUserRole } from '../components/UserRolesProvider';
import * as Grid from '@mui/x-data-grid';
import { Pagination } from '../types/pagination';

const EventList = ({
  eventsFetcher,
}: {
  eventsFetcher: (
    filter: EventFilters,
  ) => Promise<{ eventList: Event[]; pagination: Pagination }>;
}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [showPrevious, setShowPrevious] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const navigate = useNavigate();

  const filters = useSelector((state: RootState) => state.filter.filters);

  const offset = filters.offset;
  const limit = filters.limit;

  const SwitchLabel = styled('div')`
    order: ${() => (showPrevious ? 0 : 1)};
    width: 140px;
    text-align: center;
    font-family: 'Roboto', sans-serif;
  `;

  const ExportButton = styled(FilterBarButton)`
    border-color: #378805;
    background-color: #378805;
    &:hover {
      background-color: #357a38;
      border: 0.15rem solid #357a38;
    }
  `;

  const dispatch = useDispatch();
  const { isAdmin } = useUserRole();
  const [rowSelectionModel, setRowSelectionModel] =
    useState<Grid.GridRowSelectionModel>([]);

  const getEvents = (args: EventFilters) => {
    eventsFetcher(args)
      .then((response) => {
        const { eventList, pagination } = response;
        setEvents(eventList);
        dispatch(
          setEventCount({
            total: pagination.total,
            limit: pagination.limit,
          }),
        );
      })
      .catch((error) => {
        console.error(error);
        setError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getEvents({
      title: filters.title,
      types: filters.types,
      startDate: filters.startDate,
      endDate: filters.endDate,
      offset: offset,
      limit: limit,
      sortDirection: filters.sortDirection,
      sortField: filters.sortField,
    });
    if (filters === initialFilters) {
      setShowPrevious(false);
    }
  }, [filters]);

  useEffect(() => {
    dispatch(
      setFilters({
        ...filters,
        startDate: showPrevious ? null : new Date(),
        endDate: showPrevious ? new Date() : null,
      }),
    );
  }, [showPrevious]);

  const handleCreateEvent = () => {
    navigate('/event');
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const toggleShowPrevious = () => {
    setShowPrevious(!showPrevious);
  };

  const exportSelected = () => {
    exportEventsToExcel(rowSelectionModel as number[]).then((blob) => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Events.xlsx`);

      document.body.appendChild(link);

      link.click();

      link?.parentNode?.removeChild(link);
    });
  };

  return (
    <Container>
      <LoadingWrapper loading={loading} error={error}>
        <ListContainer>
          <FilterBarButtons>
            <FilterBarButton onClick={toggleFilters} label='Filters' />
            <ShowPreviousSwitch onClick={toggleShowPrevious}>
              <SwitchLabel>{showPrevious ? 'Upcoming' : 'Past'}</SwitchLabel>
              <SwitchButton label={showPrevious ? 'Past' : 'Upcoming'} />
            </ShowPreviousSwitch>
            <FilterBarButton label='New Event' onClick={handleCreateEvent} />
            {isAdmin && (
              <ExportButton
                onClick={exportSelected}
                label='Export'
                icon={<FileDownloadIcon style={{ color: 'white' }} />}
              />
            )}
          </FilterBarButtons>
          {showFilters && <EventFilter />}
          {events.length > 0 ? (
            <>
              <EventsDataGrid
                events={events}
                rowSelectionModel={rowSelectionModel}
                setRowSelectionModel={setRowSelectionModel}
              />
            </>
          ) : (
            <Message>List is currently empty</Message>
          )}
        </ListContainer>
      </LoadingWrapper>
    </Container>
  );
};

export default EventList;
