import { Box, styled } from '@mui/material';

export const Container = styled(Box)`
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
`;

export const FlexContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem 150px 1rem 150px;
`;

export const ListContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const CenterContainer = styled(Box)`
  width: 70vw;
  background-color: #ffffff;
  border: 0.1rem solid #c7c7c7;
  border-radius: 0.7rem;
`;
