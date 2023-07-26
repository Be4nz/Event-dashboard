import {
  Box,
  MenuItem,
  Modal,
  OutlinedInput,
  TextField,
  Typography,
  styled,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ButtonsBox,
  CloseButton,
  ModalBox,
  Notes,
  TopBar,
} from './styled/ModalComponents';
import { NewParticipation } from '../types/participation';
import { createParticipation } from '../api/participation';
import { Event } from '../types/event';
import { toast } from 'react-toastify';
import Select, * as SelectTypes from '@mui/material/Select';
import { setTime } from '../utils/dateUtils';
import { StyledButton } from './styled/StyledButton';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const Title = styled(Box)`
  margin-right: 2rem;
`;

const ExplainingTitle = styled(Typography)`
  color: #9fa2b4;
  font-size: 1rem;
  font-weight: 600;
  padding: 0rem 1.5rem 0rem 0rem;
`;

export default function ParticipationModal({
  handleClose,
  open,
  event,
  availableTimes,
}: {
  handleClose: () => void;
  open: boolean;
  event: Event;
  availableTimes: string[];
}) {
  const [notes, setNotes] = useState<string | undefined>();
  const [appointmentTime, setAppointmentTime] = useState<string | undefined>();
  const navigate = useNavigate();

  useEffect(() => {
    availableTimes.length > 0 && setAppointmentTime(availableTimes[0]);
  }, [open]);

  const submit = () => {
    const regDate = new Date();
    if (
      event.registrationDeadline
        ? regDate <= new Date(event.registrationDeadline)
        : regDate <= new Date(event.eventDate)
    ) {
      //changes the time string into a date variable
      let apptDate: Date | undefined = undefined;
      if (appointmentTime) {
        apptDate = setTime(new Date(event.eventDate), appointmentTime);
      }

      const participation: NewParticipation = {
        notes: notes,
        eventId: event.id,
        appointmentTime: apptDate?.toISOString(),
      };

      createParticipation(participation)
        .then(() => navigate('/events'))
        .catch((error) => {
          if (error.response.status === 400) {
            toast.error(error.response.data, {
              position: 'bottom-center',
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: false,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: 'light',
            });
          }
          navigate(`/events/${event.id}`);
        });
    } else {
      toast.error('Registration deadline for this event has passed!', {
        position: 'bottom-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
      });
    }
  };

  const handleChange = (event: SelectTypes.SelectChangeEvent) => {
    setAppointmentTime(event.target.value as string);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby='modal-modal-title'
      aria-describedby='modal-modal-description'
    >
      <ModalBox>
        <TopBar>
          <Typography id='modal-modal-title' variant='h6' component='h2'>
            Participation form
          </Typography>
          <CloseButton onClick={handleClose} endIcon={<CloseIcon />} />
        </TopBar>
        {availableTimes.length > 0 && (
          <Notes>
            <Title>
              <ExplainingTitle>Appointment time: </ExplainingTitle>
            </Title>
            <Select
              defaultValue={availableTimes[0]}
              value={appointmentTime}
              onChange={handleChange}
              input={<OutlinedInput color='primary' />}
            >
              {availableTimes?.map((time, index) => (
                <MenuItem key={index} value={String(time)}>
                  {time.toLocaleString()}{' '}
                </MenuItem>
              ))}
            </Select>
          </Notes>
        )}
        <Notes>
          <TextField
            id='standard-multiline-static'
            label='Notes'
            fullWidth
            multiline
            variant='standard'
            onChange={(e) => setNotes(e.target.value)}
          />
        </Notes>
        <br></br>
        <ButtonsBox>
          <StyledButton onClick={submit} startIcon={<CheckIcon />}>
            Submit
          </StyledButton>
        </ButtonsBox>
      </ModalBox>
    </Modal>
  );
}
