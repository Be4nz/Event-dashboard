import { Box, Chip, styled } from '@mui/material';

export const FilterBarButton = styled(Chip)`
  width: 180px;
  height: 55px;
  font-size: 17px;
  margin: 0;
  border-radius: 30px;
  color: white;
  background-color: #404cfa;
  border: 0.15rem solid #404cfa;
  transition: 0.5s;
  &:hover {
    background-color: #343ecc;
    border: 0.15rem solid #343ecc;
    cursor: pointer;
  }
`;

export const SwitchButton = styled(FilterBarButton)``;

export const ShowPreviousSwitch = styled('div')`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 320px;
  height: 55px;
  font-size: 17px;
  margin-bottom: 10px;
  border-radius: 30px;
  border: 1px solid #404cfa;
  color: black;
  background-color: white;
  cursor: pointer;
`;

export const FilterBarButtons = styled(Box)`
  display: flex;
  justify-content: space-between;
  padding: 1rem 150px 1rem 150px;
  width: inherit;
`;
