import React, { Dispatch, RefObject, SetStateAction } from 'react';
import { Modal, Typography } from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';
import {
  ButtonsBox,
  Cancel,
  CloseButton,
  Continue,
  ModalBox,
  Notes,
  TopBar,
} from './styled/ModalComponents';
import { EventFormData } from '../types/event';
import { SubmitHandler, UseFormHandleSubmit } from 'react-hook-form';
import CloseIcon from '@mui/icons-material/Close';

export default function UpdateModal({
  shouldOpenModal,
  setShouldOpenModal,
  submitButtonRef,
  handleSubmit,
  onSubmit,
}: {
  shouldOpenModal: boolean;
  setShouldOpenModal: Dispatch<SetStateAction<boolean>>;
  submitButtonRef: RefObject<HTMLButtonElement>;
  handleSubmit: UseFormHandleSubmit<EventFormData>;
  onSubmit: SubmitHandler<EventFormData>;
}) {
  return (
    <Modal
      open={shouldOpenModal}
      onClose={() => setShouldOpenModal(false)}
      aria-labelledby='modal-modal-title'
      aria-describedby='modal-modal-description'
    >
      <ModalBox>
        <TopBar>
          <Typography id='modal-modal-title' variant='h6' component='h2'>
            Confirmation required
          </Typography>
          <CloseButton
            onClick={() => setShouldOpenModal(false)}
            endIcon={<CloseIcon />}
          />
        </TopBar>
        <br></br>
        <Notes>
          <Typography
            id='modal-modal-title'
            variant='h6'
            component='h2'
            textAlign={'justify'}
          >
            Appointment time parameters have changed. All of the existing
            participants will be removed. Are you sure you want to do this?
          </Typography>
        </Notes>

        <ButtonsBox>
          <Cancel variant='outlined' onClick={() => setShouldOpenModal(false)}>
            Cancel
          </Cancel>
          <Continue
            variant='outlined'
            startIcon={<DoneIcon />}
            onClick={() => {
              handleSubmit(onSubmit)();
            }}
            name='confirm'
            ref={submitButtonRef}
            color='success'
          >
            Continue
          </Continue>
        </ButtonsBox>
      </ModalBox>
    </Modal>
  );
}
