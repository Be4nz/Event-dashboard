import React from 'react';
import { Box, Button, Modal, Typography, styled } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import {
  ButtonsBox,
  Cancel,
  CloseButton,
  Delete,
  ModalBox,
  Notes,
  TopBar,
} from './styled/ModalComponents';
import { deleteEvent, restoreEvent } from '../api/events';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Event } from '../types/event';
import CloseIcon from '@mui/icons-material/Close';

const Undo = styled(Button)`
  display: inline-block;
  padding: 0;
  float: right;
  width: 50%;
`;
const Text = styled(Typography)`
  display: inline-block;
  align-items: center;
`;

export default function DeleteModal({
  handleClose,
  open,
  event,
}: {
  handleClose: () => void;
  open: boolean;
  event: Event;
}) {
  const navigate = useNavigate();

  const undoDelete = () => {
    restoreEvent(event.id).then(() => {
      toast.dismiss();
      navigate(`/events/${event.id}`);
    });
  };

  const Msg = () => (
    <Box>
      <Text>Event deleted!</Text>
      <Undo onClick={undoDelete}>Undo</Undo>
    </Box>
  );

  const confirmDelete = () => {
    deleteEvent(event.id).then(() => {
      navigate('/events');
      toast.success(<Msg />, {
        position: 'bottom-center',
        autoClose: 10000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
      });
    });
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
            Event deletion
          </Typography>
          <CloseButton onClick={handleClose} endIcon={<CloseIcon />} />
        </TopBar>
        <br></br>
        <Notes>
          <Typography id='modal-modal-title' variant='h6' component='h2'>
            Are you sure you want to delete this event?
          </Typography>
        </Notes>
        <ButtonsBox>
          <Cancel onClick={handleClose}>Cancel</Cancel>
          <Delete
            onClick={confirmDelete}
            startIcon={<DeleteIcon />}
            color='error'
          >
            Delete
          </Delete>
        </ButtonsBox>
      </ModalBox>
    </Modal>
  );
}
