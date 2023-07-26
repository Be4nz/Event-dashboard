import React, { FC, useEffect, useRef, useState } from 'react';
import { TimePicker } from '@mui/x-date-pickers';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import DoneIcon from '@mui/icons-material/Done';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import {
  Alert,
  styled,
  Container,
  TextField,
  Stack,
  MenuItem,
  Box,
  Button,
} from '@mui/material';
import {
  EventType,
  EventFormData,
  NewEventRequest,
  eventTypes,
  Event,
  EventSubtype,
  personalSubtypes,
  companySubtypes,
} from '../types/event';
import { createEvent, updateEvent } from '../api/events';
import { useNavigate } from 'react-router-dom';
import LoadingWrapper from './LoadingWrapper';
import { useTheme } from '@mui/material/styles';
import { compareTimes, formatTime } from '../utils/dateUtils';
import dayjs from 'dayjs';
import { getAllGroups, getAllUsers } from '../api/users';
import { ShareListProp, User } from '../types/user';
import ShareList from './ShareList';
import UpdateModal from './UpdateModal';
import {
  deleteAllEventParticipations,
  getParticipationsByEvent,
} from '../api/participation';
import { StyledButton } from './styled/StyledButton';
import ImageIcon from '@mui/icons-material/Image';
import IosShareIcon from '@mui/icons-material/IosShare';

export interface EventFormProps {
  event?: Event;
}

const ButtonsBox = styled(Box)`
  display: flex;
  justify-content: space-between;
  padding: 0 rem;
`;

const CreateButton = styled(StyledButton)`
  width: 100;
  border-color: #378805;
  background-color: #378805;
  &:hover {
    background-color: #357a38;
    border: 0.15rem solid #357a38;
  }
`;

const SelectType = styled(TextField)`
  width: 47%;
  margin-right: 10px;
`;

const SelectSubtype = styled(SelectType)`
  float: right;
`;

const SelectBox = styled(Box)`
  display: inline;
`;

const StartTime = styled(TimePicker)`
  width: 30%;
`;

const EndTime = styled(StartTime)`
  margin-left: 5%;
`;

const Duration = styled(TextField)`
  width: 30%;
  float: right;
`;

const ShareButton = styled(StyledButton)`
  padding: 1em 1em;
  margin: 1rem;
  width: 100;
  border-color: 0.15rem solid #404cfa;
  background-color: #404cfa;
  transition: 0.5s;
  &:hover {
    background-color: #343ecc;
    border: 0.15rem solid #343ecc;
    cursor: pointer;
  }
`;

const EventForm: FC<EventFormProps> = ({ event }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [imageTitle, setImageTitle] = useState<string>(event?.imageUrl || '');
  const [largeFile, setLargeFile] = useState<boolean>(false);
  const [participants, setParticipants] = useState<boolean>(false);
  const [shouldOpenModal, setShouldOpenModal] = useState<boolean>(false);
  const [shareable, setShareable] = useState<ShareListProp[]>([]);
  const [sharedUsers, setSharedUsers] = useState<User[]>([]);
  const [showShareList, setShowShareList] = useState<boolean>(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const eventDate = event ? new Date(event.eventDate) : undefined;
  const registrationDeadline =
    event && event.registrationDeadline
      ? new Date(event.registrationDeadline)
      : undefined;

  const startTimeValue = event?.startTime
    ? new Date(event.startTime)
    : undefined;
  const endTimeValue = event?.endTime ? new Date(event.endTime) : undefined;
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
    clearErrors,
  } = useForm<EventFormData>({
    mode: 'onChange',
    defaultValues: {
      title: event ? event.title : '',
      type: event ? (event.type as EventType) : EventType.CompanyManaged,
      subtype: event?.subtype
        ? (event.subtype as EventSubtype)
        : EventSubtype.Other,
      description: event ? event.description : '',
      eventDate: eventDate,
      registrationDeadline: registrationDeadline,
      startTime: startTimeValue,
      endTime: endTimeValue,
      duration: event ? event.duration : undefined,
      image: undefined,
    },
  });

  const eventDateWatched = watch('eventDate');
  const type = watch('type');
  const subtype = watch('subtype');
  const startTime = watch('startTime');
  const endTime = watch('endTime');
  const duration = watch('duration');

  useEffect(() => {
    Promise.all([getAllUsers(), getAllGroups()])
      .then(([users, groups]) => {
        setShareable([...users, ...groups]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!event) {
      setValue(
        'subtype',
        type !== EventType.External ? EventSubtype.Other : undefined,
      );
    } else {
      getParticipationsByEvent(String(event?.id), 0, 5).then((participants) => {
        setParticipants(participants.length > 0);
      });
    }
  }, [type, setValue]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files && event.target.files[0];
    if (selectedFile && selectedFile.size / (1024 * 1024) > 1) {
      setLargeFile(true);
      setImageTitle('');
      setFile(null);
    } else {
      setLargeFile(false);
      selectedFile && setImageTitle(selectedFile.name.toString());
      setFile(selectedFile);
    }
  };

  const toggleShareList = () => {
    setShowShareList(!showShareList);
  };

  const onSubmit: SubmitHandler<EventFormData> = (data: EventFormData) => {
    const submitButtonName = submitButtonRef.current?.name;
    setLoading(true);

    //sets the year, month and day of the startTime and endTime
    //variables to match the eventDate values
    let correctStartTime: Date | undefined = undefined;
    let correctEndTime: Date | undefined = undefined;
    if (data.startTime && data.endTime) {
      correctStartTime = new Date(data.eventDate);
      correctEndTime = new Date(data.eventDate);
      data.startTime = new Date(data.startTime.toISOString());
      data.endTime = new Date(data.endTime.toISOString());
      correctStartTime.setHours(data.startTime.getHours());
      correctStartTime.setMinutes(data.startTime.getMinutes());
      correctEndTime.setHours(data.endTime.getHours());
      correctEndTime.setMinutes(data.endTime.getMinutes());
    }

    const newEvent: NewEventRequest = {
      ...data,
      type: data.type,
      subtype: data.subtype,
      eventDate: data.eventDate?.toISOString(),
      registrationDeadline: data.registrationDeadline?.toISOString(),
      startTime: data.startTime?.toISOString(),
      endTime: data.endTime?.toISOString(),
      duration: data.duration,
      image: file,
      shareWith: sharedUsers.map((user) => user.id),
    };
    if (!event) {
      createEvent(newEvent)
        .then(() => {
          navigate('/events');
        })
        .catch(() => {
          setError(true);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      const updatedEvent = {
        ...newEvent,
        id: event.id,
        createdBy: event.createdBy,
      };

      const hasFieldsChanged =
        (event.startTime !== updatedEvent.startTime ||
          event.endTime !== updatedEvent.endTime ||
          event.duration !== updatedEvent.duration) &&
        participants;

      if (!hasFieldsChanged || event.subtype !== 'APPOINTMENT') {
        updateEvent(updatedEvent)
          .then(() => {
            navigate('/events');
          })
          .catch(() => {
            setError(true);
          })
          .finally(() => {
            setLoading(false);
          });
      } else if (hasFieldsChanged && submitButtonName == 'update') {
        setShouldOpenModal(true);
      } else if (hasFieldsChanged && submitButtonName == 'confirm') {
        deleteAllEventParticipations(event.id).then(() => {
          updateEvent(updatedEvent)
            .then(() => {
              navigate('/events');
            })
            .catch(() => {
              setError(true);
            })
            .finally(() => {
              setLoading(false);
            });
        });
      }
    }
  };

  return (
    <Container maxWidth='md'>
      <LoadingWrapper loading={loading} error={error}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            <Controller
              name='title'
              control={control}
              rules={{
                required: true,
                minLength: 3,
                maxLength: 100,
              }}
              render={({ field: { onChange, value } }) => (
                <TextField
                  required
                  multiline
                  fullWidth
                  id='event-title'
                  label='Event title'
                  variant='outlined'
                  value={value}
                  onChange={onChange}
                  error={!!errors?.title}
                  helperText={
                    (errors.title?.type === 'required' &&
                      'Title is required') ||
                    (errors.title?.type === 'minLength' &&
                      'Title must be at least 3 letters') ||
                    (errors.title?.type === 'maxLength' &&
                      'Title must be less than 100 letters')
                  }
                />
              )}
            />
            <SelectBox>
              <Controller
                name='type'
                control={control}
                rules={{ required: true }}
                render={({ field: { onChange, value } }) => (
                  <SelectType
                    id='select-event-type'
                    select
                    fullWidth
                    label='Select event type'
                    variant='outlined'
                    error={!!errors?.type}
                    helperText={errors.type && 'Type is required'}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                  >
                    {eventTypes.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </SelectType>
                )}
              />
              {type !== 'EXTERNAL' && (
                <Controller
                  name='subtype'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { onChange, value } }) => (
                    <SelectSubtype
                      id='select-event-subtype'
                      select
                      fullWidth
                      label='Select event subtype'
                      variant='outlined'
                      error={!!errors?.subtype}
                      helperText={errors.subtype && 'Subtype is required'}
                      value={value}
                      onChange={(e) => {
                        onChange(e.target.value);
                      }}
                    >
                      {(type === 'PERSONAL'
                        ? personalSubtypes
                        : companySubtypes
                      ).map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </SelectSubtype>
                  )}
                />
              )}
            </SelectBox>
            {subtype == 'APPOINTMENT' && (
              <SelectBox>
                <Controller
                  name='startTime'
                  control={control}
                  rules={{
                    required: true,
                    validate: (value) => {
                      if (value instanceof Date && isNaN(value.getTime())) {
                        return 'Invalid time format';
                      }
                      if (
                        value &&
                        eventDate &&
                        compareTimes(value, eventDate) === -1
                      ) {
                        return 'Appointment start time must be later than event start time';
                      }
                      return true;
                    },
                  }}
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
                    <StartTime
                      label='Start time'
                      onChange={(e) => {
                        onChange(e);
                        clearErrors('eventDate');
                      }}
                      ampm={false}
                      minTime={eventDate && dayjs(formatTime(eventDate))}
                      maxTime={dayjs(endTime)}
                      value={value ? dayjs(value) : null}
                      slotProps={{
                        textField: {
                          helperText: error ? (
                            <span style={{ color: theme.palette.error.main }}>
                              {error.message}
                            </span>
                          ) : (
                            ''
                          ),
                          required: true,
                        },
                      }}
                    />
                  )}
                />
                <Controller
                  name='endTime'
                  control={control}
                  rules={{
                    required: true,
                    validate: (value) => {
                      if (value instanceof Date && isNaN(value.getTime())) {
                        return 'Invalid time format';
                      }
                      return true;
                    },
                  }}
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
                    <EndTime
                      label='End time'
                      onChange={onChange}
                      ampm={false}
                      minTime={dayjs(startTime)}
                      value={value ? dayjs(value) : null}
                      slotProps={{
                        textField: {
                          helperText: error ? (
                            <span style={{ color: theme.palette.error.main }}>
                              {error.message}
                            </span>
                          ) : (
                            ''
                          ),
                          required: true,
                        },
                      }}
                    />
                  )}
                />

                <Controller
                  name='duration'
                  control={control}
                  rules={{ required: true }}
                  render={({ field: { onChange, value } }) => {
                    let maxDuration = 1440;
                    if (
                      startTime instanceof Date &&
                      !isNaN(startTime.getTime()) &&
                      endTime instanceof Date &&
                      !isNaN(endTime.getTime())
                    ) {
                      maxDuration = Math.round(
                        (endTime.getTime() - startTime.getTime()) / 60000,
                      );
                    }
                    return (
                      <Duration
                        label='Duration (minutes)'
                        type='number'
                        required
                        value={value}
                        onChange={onChange}
                        error={!!errors?.duration}
                        helperText={errors.duration && 'Duration is required'}
                        InputProps={{
                          inputProps: {
                            min: 0,
                            max: maxDuration,
                          },
                        }}
                      ></Duration>
                    );
                  }}
                />
              </SelectBox>
            )}

            <Controller
              name='description'
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextField
                  label='Description'
                  variant='outlined'
                  fullWidth
                  multiline
                  rows={4}
                  value={value}
                  onChange={onChange}
                />
              )}
            />
            <Controller
              name='eventDate'
              control={control}
              rules={{
                required: true,
                validate: (value) => {
                  if (
                    value &&
                    startTime &&
                    compareTimes(value, startTime) === 1
                  ) {
                    return 'Event date time must be earlier than appointment start time';
                  }
                  return (
                    (value && value >= new Date()) ||
                    'Event date must be later than today'
                  );
                },
              }}
              render={({ field: { onChange, value } }) => (
                <DateTimePicker
                  label='Select event date and time'
                  defaultValue={dayjs(eventDate)}
                  value={value ? dayjs(value) : null}
                  onChange={(e) => (onChange(e), clearErrors('startTime'))}
                  minDate={dayjs(new Date())}
                  disablePast
                  ampm={false}
                  slotProps={{
                    textField: {
                      helperText: error ? (
                        <span style={{ color: theme.palette.error.main }}>
                          {errors?.eventDate?.message}
                        </span>
                      ) : (
                        ''
                      ),
                    },
                  }}
                />
              )}
            />
            {type !== 'PERSONAL' && (
              <Controller
                name='registrationDeadline'
                control={control}
                rules={{
                  required: false,
                  validate: (value) => {
                    if (!value) {
                      return true;
                    }
                    if (value >= new Date() && value <= eventDateWatched) {
                      return true;
                    }
                    if (value > eventDateWatched) {
                      return 'Registration deadline must be before event date';
                    }
                    return 'Registration deadline must be later than today';
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <DateTimePicker
                    label='Select registration deadline date and time'
                    defaultValue={dayjs(registrationDeadline)}
                    value={value ? dayjs(value) : null}
                    onChange={onChange}
                    disablePast
                    ampm={false}
                    minDate={dayjs(new Date())}
                    maxDate={dayjs(eventDateWatched)}
                    slotProps={{
                      textField: {
                        helperText: errors?.registrationDeadline?.message,
                      },
                    }}
                  />
                )}
              />
            )}
          </Stack>
          <ButtonsBox>
            <Controller
              name='image'
              control={control}
              render={() => (
                <Button
                  component='label'
                  sx={{
                    color: '#fff',
                    width: '13rem',
                    padding: '1em 1em',
                    margin: '1rem',
                    borderRadius: '2rem',
                    backgroundColor: '#404cfa',
                    border: '0.15rem solid #404cfa',
                    transition: '0.5s',
                    '&:hover': {
                      backgroundColor: '#343ecc',
                      border: '0.15rem solid #343ecc',
                      cursor: 'pointer',
                    },
                  }}
                  startIcon={<ImageIcon />}
                >
                  Upload an image
                  <input
                    onChange={handleFileChange}
                    type='file'
                    multiple
                    accept='image/*'
                    hidden
                  />
                </Button>
              )}
            />
            <ShareButton
              startIcon={<IosShareIcon />}
              onClick={() => toggleShareList()}
            >
              Share event
            </ShareButton>
            {event &&
            event.subtype == 'APPOINTMENT' &&
            participants &&
            (event?.startTime !== new Date(startTime!).toISOString() ||
              event?.endTime !== new Date(endTime!).toISOString() ||
              String(event?.duration) !== String(duration)) ? (
              <CreateButton
                variant='outlined'
                type='button'
                onClick={() => {
                  setShouldOpenModal(true);
                }}
                startIcon={<DoneIcon />}
                color='success'
              >
                {'Update'}
              </CreateButton>
            ) : (
              <CreateButton
                type='submit'
                name='update'
                ref={submitButtonRef}
                startIcon={<DoneIcon />}
                color='success'
              >
                {!event ? 'Create' : 'Update'}
              </CreateButton>
            )}
          </ButtonsBox>
          {largeFile && (
            <Alert severity='error'>The file size must be less then 1MB</Alert>
          )}
          {imageTitle && (
            <Alert severity='success'>Uploaded file: {imageTitle}</Alert>
          )}
          {showShareList && (
            <ShareList data={shareable} setSharedUsers={setSharedUsers} />
          )}

          <UpdateModal
            shouldOpenModal={shouldOpenModal}
            setShouldOpenModal={setShouldOpenModal}
            submitButtonRef={submitButtonRef}
            handleSubmit={handleSubmit}
            onSubmit={onSubmit}
          />
        </form>
      </LoadingWrapper>
    </Container>
  );
};

export default EventForm;
