import React, { useEffect, useState } from 'react';
import CreateEventForm from '../components/EventForm';
import { Event } from '../types/event';
import { useParams } from 'react-router-dom';
import { getEvent } from '../api/events';
import LoadingWrapper from '../components/LoadingWrapper';
import Message from '../components/styled/Message';
import { Box } from '@mui/material';
import { getCurrentUser } from '../auth/getAccessToken';
import { useUserRole } from '../components/UserRolesProvider';
import * as MsalTypes from '@azure/msal-browser';

const EditEvent = () => {
  const [event, setEvent] = useState<Event>();
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<
    MsalTypes.AccountInfo | undefined
  >();

  const { id } = useParams();
  const { isAdmin } = useUserRole();

  useEffect(() => {
    getCurrentUser().then((user) => {
      setCurrentUser(user);
    });
    if (id) {
      getEvent(parseInt(id))
        .then((data) => {
          setEvent(data);
        })
        .catch((error) => {
          console.error(error);
          setError(true);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  return (
    <LoadingWrapper loading={loading} error={error}>
      <Box>
        {(isAdmin || currentUser?.localAccountId === event?.createdBy) &&
        event ? (
          <CreateEventForm event={event} />
        ) : (
          <Message>Event not found</Message>
        )}
      </Box>
    </LoadingWrapper>
  );
};

export default EditEvent;
