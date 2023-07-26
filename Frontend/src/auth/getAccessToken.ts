import { InteractionRequiredAuthError } from '@azure/msal-browser';
import * as MsalTypes from '@azure/msal-browser';
import { msalInstance } from '../msalInstance';

const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;

export const getCurrentUser = async (): Promise<MsalTypes.AccountInfo> => {
  return new Promise<MsalTypes.AccountInfo>((resolve) => {
    const checkAccount = () => {
      const account = msalInstance.getActiveAccount();
      if (account !== null) {
        resolve(account);
      } else {
        setTimeout(checkAccount, 100);
      }
    };

    checkAccount();
  });
};

export const getAccessToken = async () => {
  const currentUser = await getCurrentUser();

  const accessTokenRequest: MsalTypes.SilentRequest = {
    scopes: [`api://${CLIENT_ID}/Data.Read`],
    account: currentUser,
  };

  try {
    const accessTokenResponse: MsalTypes.AuthenticationResult =
      await msalInstance.acquireTokenSilent(accessTokenRequest);
    return accessTokenResponse.accessToken;
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      await msalInstance.acquireTokenRedirect(accessTokenRequest);
      return '';
    }
    console.error(error);
    return '';
  }
};
