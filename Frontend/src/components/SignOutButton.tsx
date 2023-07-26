import React from 'react';
import { useMsal } from '@azure/msal-react';
import { styled, IconButton } from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

const Logout = styled(ExitToAppIcon)`
  color: white;
`;
const LogoutButton = styled(IconButton)`
  margin-left: auto;
`;

export const SignOutButton = () => {
  const { instance } = useMsal();

  const handleLogout = () => {
    instance.logoutRedirect({
      postLogoutRedirectUri: '/',
    });
  };

  return (
    <LogoutButton onClick={() => handleLogout()}>
      <Logout />
    </LogoutButton>
  );
};
