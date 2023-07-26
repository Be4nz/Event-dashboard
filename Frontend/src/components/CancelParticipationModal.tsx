import React from 'react';
import { Modal, Typography } from '@mui/material';
import {
  ButtonsBox,
  Cancel,
  CloseButton,
  Delete,
  ModalBox,
  Notes,
  TopBar,
} from './styled/ModalComponents';
import 'react-toastify/dist/ReactToastify.css';
import { Event } from '../types/event';
import { deleteParticipation } from '../api/participation';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';

export default function CancelParticipationModal({
  handleClose,
  open,
  event,
  setParticipates,
}: {
  handleClose: () => void;
  open: boolean;
  event: Event;
  setParticipates: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const navigate = useNavigate();
  const confirmCancel = () => {
    deleteParticipation(event.id);
    handleClose();
    setParticipates(false);
    navigate(`/events`);
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
            Cancel participation
          </Typography>
          <CloseButton onClick={handleClose} endIcon={<CloseIcon />} />
        </TopBar>
        <Notes>
          <Typography id='modal-modal-title' variant='h6' component='h2'>
            Are you sure you no longer want to participate in this event?
          </Typography>
        </Notes>
        <br></br>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <ButtonsBox>
            <Cancel onClick={handleClose}>Cancel</Cancel>
            <Delete onClick={confirmCancel} color='error'>
              Confirm
            </Delete>
          </ButtonsBox>
        </div>
      </ModalBox>
    </Modal>
  );
}
