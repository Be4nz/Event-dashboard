import axios from 'axios';
import authHeader from '../auth/authHeader';
import { getAccessToken } from '../auth/getAccessToken';

const URL = process.env.REACT_APP_API_URL;

export const getUserInfoFromOid = async (oid: string) => {
  return getAccessToken().then(async (accessToken) => {
    const response = await axios.get(`${URL}/user/${oid}`, {
      headers: authHeader(accessToken),
    });
    return response.data;
  });
};

export const getRoles = async () => {
  return getAccessToken().then(async (accessToken) => {
    const response = await axios.get(`${URL}/user/roles`, {
      headers: authHeader(accessToken),
    });
    return response.data;
  });
};

export const getAllUsers = async () => {
  return getAccessToken().then(async (accessToken) => {
    const response = await axios.get(`${URL}/user/all`, {
      headers: authHeader(accessToken),
    });
    return response.data;
  });
};

export const getAllGroups = async () => {
  return getAccessToken().then(async (accessToken) => {
    const response = await axios.get(`${URL}/user/groups`, {
      headers: authHeader(accessToken),
    });
    return response.data;
  });
};
