import { Box, Button, styled } from '@mui/material';
import { StyledButton } from './StyledButton';

export const ModalBox = styled(Box)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60%;
  background-color: white;
  border: 1px solid #000;
  box-shadow: 24px;
`;

export const ButtonsBox = styled(Box)`
  display: flex;
  justify-content: end;
  align-items: end;
  margin: 3rem 1rem 1rem auto;
`;

export const TopBar = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #333333;
  color: white;
  padding: 1rem 2rem 1rem 2rem;
`;

export const CloseButton = styled(Button)`
  color: white;
  background: none;
  border: none;
`;

export const Notes = styled(Box)`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 2rem 2rem 0rem 2rem;
`;

export const Cancel = styled(StyledButton)`
  right: 10px;
`;

export const Delete = styled(StyledButton)`
  background-color: #e62f4c;
  border: 0.15rem solid #e62f4c;
  &:hover {
    background-color: #d30000;
    border: 0.15rem solid #d30000;
  }
`;

export const Continue = styled(StyledButton)`
  border-color: #378805;
  background-color: #378805;
  &:hover {
    background-color: #357a38;
    border: 0.15rem solid #357a38;
  }
`;
