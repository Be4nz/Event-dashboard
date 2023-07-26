import { Button, styled } from '@mui/material';

export const StyledButton = styled(Button)`
  color: #fff;
  width: 13rem;
  padding: 1em 1em;
  margin: 1rem;
  border-radius: 2rem;
  background-color: #404cfa;
  border: 0.15rem solid #404cfa;
  transition: 0.5s;
  &:hover {
    background-color: #343ecc;
    border: 0.15rem solid #343ecc;
    cursor: pointer;
  }
`;
