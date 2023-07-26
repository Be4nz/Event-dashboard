import { Typography, styled } from '@mui/material';

const Message = styled(Typography)`
  margin: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  font-weight: bold;
  text-align: center;
`;
export default Message;
