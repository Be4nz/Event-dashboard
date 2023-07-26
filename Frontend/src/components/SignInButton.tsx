import React, { useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../auth/authConfig';
import { Button, styled } from '@mui/material';
import { msalInstance } from '../msalInstance';

const Login = styled(Button)`
  margin: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
`;

export const SignInButton = () => {
  const { instance } = useMsal();

  const handleLogin = () => {
    instance.loginRedirect(loginRequest).catch((e) => {
      console.error(e);
    });
  };

  useEffect(() => {
    const handleRedirect = async () => {
      const authResult = await msalInstance.handleRedirectPromise();

      if (authResult) {
        msalInstance.setActiveAccount(authResult.account);
      }
    };

    handleRedirect();
  }, [instance]);

  return (
    <>
      <Login variant='contained' onClick={() => handleLogin()}>
        Sign in
      </Login>
    </>
  );
};
