const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const URL = process.env.REACT_APP_URL;
const AUTHORITY = process.env.REACT_APP_AUTHORITY;

export const msalConfig = {
  auth: {
    clientId: `${CLIENT_ID}`,
    authority: `https://login.microsoftonline.com/${AUTHORITY}`,
    redirectUri: `${URL}/events`,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ['User.Read', `api://${CLIENT_ID}/Data.Read`],
};
