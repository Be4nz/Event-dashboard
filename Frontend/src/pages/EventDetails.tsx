import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  exportEventsToExcel,
  getAvailableTimes,
  getEvent,
  getImage,
} from '../api/events';
import {
  Event,
  EventType,
  companySubtypes,
  eventTypes,
  personalSubtypes,
} from '../types/event';
import { Box, Stack, styled, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import LoadingWrapper from '../components/LoadingWrapper';
import ParticipationModal from '../components/ParticipationModal';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DeleteModal from '../components/DeleteModal';
import Message from '../components/styled/Message';
import { Buffer } from 'buffer';
import { StyledButton } from '../components/styled/StyledButton';
import {
  CenterContainer,
  Container,
  FlexContainer,
} from '../components/styled/Containers';
import { DateCell } from '../components/EventsDataGrid/DateCell';
import DetailsCell from '../components/DetailsCell';
import { checkIfParticipates } from '../api/participation';
import { getUserInfoFromOid } from '../api/users';
import { getCurrentUser } from '../auth/getAccessToken';
import { useUserRole } from '../components/UserRolesProvider';
import ParticipantList from '../components/ParticipantList';
import CancelParticipationModal from '../components/CancelParticipationModal';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SharedDisplayList from '../components/SharedDisplayList';
import { User } from '../types/user';
import * as MsalTypes from '@azure/msal-browser';

const EventHeader = styled(Typography)`
  font-size: 1.5rem;
  font-weight: 600;
  padding: 2rem 0rem 2rem 3rem;
  width: 100%;
`;

const EventDetailsBox = styled(Box)`
  display: flex;
  flex-direction: row;
`;

const EventTypesBox = styled(Box)`
  width: 26rem;
  padding: 0rem 0rem 2rem 0rem;
`;

const EventContentBox = styled(Box)`
  display: flex;
  flex-direction: row;
  padding: 2rem 0rem 2rem 3rem;
`;

const EventDetailsText = styled(Typography)`
  font-size: 1rem;
  font-weight: 500;
  padding: 0rem 1.5rem 0rem 3rem;
`;

const ImageContainer = styled(Box)`
  width: 30rem;
  height: 20rem;
  position: relative;
  overflow: hidden;
  & img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;
    top: 0;
    left: 0;
  }
`;

const ExplainingTitle = styled(Typography)`
  color: #9fa2b4;
  font-size: 1rem;
  font-weight: 600;
  padding: 0rem 1.5rem 0rem 3rem;
`;

const EventDescription = styled(Typography)`
  padding: 0rem 3rem 0rem 3rem;
  text-align: justify;
`;

const EventDescriptionExplainingTitle = styled(ExplainingTitle)`
  border: none;
  margin-bottom: 1rem;
`;

const Delete = styled(StyledButton)`
  background-color: #e62f4c;
  border: 0.15rem solid #e62f4c;
  &:hover {
    background-color: #d30000;
    border: 0.15rem solid #d30000;
  }
`;

const ButtonsBox = styled(Box)`
  display: flex;
  justify-content: space-between;
  padding: 0rem 2rem 1rem 2rem;
`;

const ExportButton = styled(StyledButton)`
  width: 100;
  border-color: #378805;
  background-color: #378805;
  &:hover {
    background-color: #357a38;
    border: 0.15rem solid #357a38;
  }
`;

const ListBox = styled(Box)`
  display: flex;
  flex-direction: row;
`;

const EventDetails = () => {
  const [currentUser, setCurrentUser] = useState<
    MsalTypes.AccountInfo | undefined
  >();
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [event, setEvent] = useState<Event>();
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [expired, setExpired] = useState<boolean>(false);
  const [participates, setParticipates] = useState<boolean>(false);
  const [noTimes, setNoTimes] = useState<boolean>(false);
  const [imageSrc, setImageSrc] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();

  const { id } = useParams();

  //Modal params
  //ParticipateModal
  const [openParticipation, setOpenParticipation] = useState<boolean>(false);
  const handleParticipationClose = () => setOpenParticipation(false);
  const handleParticipationOpen = () => setOpenParticipation(true);
  //DeleteModal
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const handleOpenDelete = () => setOpenDelete(true);
  const handleCloseDelete = () => setOpenDelete(false);
  const handleEdit = () => navigate(`/event/${id}`);
  //CancelParticipationModal
  const [openCancelParticipation, setOpenCancelParticipation] =
    useState<boolean>(false);
  const handleOpenCancelParticipation = () => setOpenCancelParticipation(true);
  const handleCloseCancelParticipation = () =>
    setOpenCancelParticipation(false);

  useEffect(() => {
    getCurrentUser().then((user) => {
      setCurrentUser(user);
    });
    if (
      event &&
      event.imageUrl !== null &&
      event.imageUrl !== '' &&
      event.imageUrl != undefined
    )
      getImage(event.imageUrl)
        .then((response) => {
          const base64String = `data:image/*;base64,${Buffer.from(
            response,
            'binary',
          ).toString('base64')}`;
          setImageSrc(base64String);
        })
        .catch((error) => {
          console.error(error);
          return undefined;
        });
  }, [event]);

  useEffect(() => {
    if (id) {
      getEvent(parseInt(id))
        .then((data) => {
          setEvent(data);
          if (
            new Date(data.registrationDeadline ?? data.eventDate) < new Date()
          ) {
            setExpired(true);
          }

          getTimes(data);
        })
        .catch((error) => {
          if (error.response.status === 404) navigate('/events');
          setError(true);
        })
        .finally(() => {
          setLoading(false);
          checkIfParticipates(parseInt(id)).then((response: any) => {
            if (response) {
              setParticipates(true);
            }
          });
        });
    }
  }, [id, participates]);

  const fetchUsers = async () => {
    if (event && event.shareWith) {
      const userPromises = event.shareWith.map((element) =>
        getUserInfoFromOid(element),
      );
      const userData = await Promise.all(userPromises);
      setUsers(userData);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [event]);

  const getTimes = (event: Event) => {
    event.subtype === 'APPOINTMENT' &&
      getAvailableTimes(event.id).then((data) => {
        setAvailableTimes(data.availableTimes);
        if (data.availableTimes.length === 0) {
          setNoTimes(true);
        }
      });
  };

  const getEventTypeLabel = (eventType: EventType): string => {
    const eventTypeObj = eventTypes.find((e) => e.value === eventType);
    return eventTypeObj ? eventTypeObj.label : '';
  };

  const getEventSubtypeLabel = (event: Event): string => {
    const subtypeArray =
      event.type === EventType.Personal ? personalSubtypes : companySubtypes;
    const subtypeObj = subtypeArray.find((s) => s.value === event.subtype);
    return subtypeObj ? subtypeObj.label : '';
  };

  const exportEvent = (event: Event) => {
    const eventIds: number[] = [];
    eventIds.push(event.id);
    exportEventsToExcel(eventIds).then((blob) => {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${event.title}.xlsx`);

      document.body.appendChild(link);

      link.click();

      link?.parentNode?.removeChild(link);
    });
  };

  return (
    <Container>
      <LoadingWrapper loading={loading} error={error}>
        {event &&
        (isAdmin ||
          !event.shareWith ||
          event.shareWith.length === 0 ||
          (currentUser &&
            event.shareWith.includes(currentUser.localAccountId))) ? (
          <FlexContainer>
            <CenterContainer>
              <EventHeader>{event.title}</EventHeader>
              <EventDetailsBox>
                <EventTypesBox>
                  <Stack>
                    <ExplainingTitle>Event type</ExplainingTitle>
                    <EventDetailsText>
                      <DetailsCell
                        main={getEventTypeLabel(event.type as EventType)}
                        sub={getEventSubtypeLabel(event)}
                      />
                    </EventDetailsText>
                  </Stack>
                </EventTypesBox>
                <Stack>
                  <ExplainingTitle>Event date</ExplainingTitle>
                  <EventDetailsText>
                    <DateCell dateString={event.eventDate} />
                  </EventDetailsText>
                </Stack>
                {event.subtype == 'APPOINTMENT' && (
                  <>
                    <Stack>
                      <ExplainingTitle>Start time</ExplainingTitle>
                      <EventDetailsText>
                        <DateCell dateString={event.startTime!} />
                      </EventDetailsText>
                    </Stack>
                    <Stack>
                      <ExplainingTitle>End time</ExplainingTitle>
                      <EventDetailsText>
                        <DateCell dateString={event.endTime!} />
                      </EventDetailsText>
                    </Stack>
                    <Stack>
                      <ExplainingTitle>Duration</ExplainingTitle>
                      <EventDetailsText>
                        <DetailsCell main={`${event.duration} min.`} />
                      </EventDetailsText>
                    </Stack>
                  </>
                )}
                <Stack>
                  {event.registrationDeadline && (
                    <>
                      <ExplainingTitle>Registration deadline</ExplainingTitle>
                      <EventDetailsText>
                        <DateCell dateString={event.registrationDeadline} />
                      </EventDetailsText>
                    </>
                  )}
                </Stack>
              </EventDetailsBox>
              <EventContentBox>
                {imageSrc && imageSrc !== '' && (
                  <ImageContainer>
                    <img src={imageSrc} alt={'Event image'} />
                  </ImageContainer>
                )}
                <Stack maxWidth={'60%'}>
                  <EventDescriptionExplainingTitle>
                    Event description
                  </EventDescriptionExplainingTitle>
                  <EventDescription>
                    {event.description && event.description.length < 800
                      ? `${event.description}`
                      : `${event.description?.substring(0, 800)}...`}
                  </EventDescription>
                </Stack>
              </EventContentBox>
              <ButtonsBox>
                {(isAdmin ||
                  currentUser?.localAccountId === event.createdBy) && (
                  <Box>
                    <StyledButton startIcon={<EditIcon />} onClick={handleEdit}>
                      Edit
                    </StyledButton>
                    <Delete
                      startIcon={<DeleteIcon />}
                      onClick={handleOpenDelete}
                    >
                      Delete
                    </Delete>
                  </Box>
                )}

                <Box>
                  {(isAdmin ||
                    currentUser?.localAccountId === event.createdBy) && (
                    <ExportButton
                      startIcon={<FileDownloadIcon />}
                      onClick={() => {
                        exportEvent(event);
                      }}
                    >
                      Export
                    </ExportButton>
                  )}
                  {event.type !== 'PERSONAL' &&
                    !((expired || noTimes) && !participates) && (
                      <StyledButton
                        onClick={
                          participates
                            ? handleOpenCancelParticipation
                            : handleParticipationOpen
                        }
                        startIcon={participates ? '' : <CheckIcon />}
                      >
                        {participates ? 'Cancel participation' : 'Participate'}
                      </StyledButton>
                    )}
                </Box>
              </ButtonsBox>
              {(isAdmin || currentUser?.localAccountId === event.createdBy) && (
                <ListBox>
                  <ParticipantList event={event} currentUser={currentUser} />
                  <SharedDisplayList users={users} />
                </ListBox>
              )}
            </CenterContainer>
            <ParticipationModal
              handleClose={handleParticipationClose}
              open={openParticipation}
              event={event}
              availableTimes={availableTimes}
            />

            <DeleteModal
              handleClose={handleCloseDelete}
              open={openDelete}
              event={event}
            />

            <CancelParticipationModal
              handleClose={handleCloseCancelParticipation}
              open={openCancelParticipation}
              event={event}
              setParticipates={setParticipates}
            />
          </FlexContainer>
        ) : (
          <Message>Event not found</Message>
        )}
      </LoadingWrapper>
    </Container>
  );
};

export default EventDetails;
