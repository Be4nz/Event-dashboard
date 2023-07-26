import axios from 'axios';
import authHeader from '../auth/authHeader';
import { getAccessToken } from '../auth/getAccessToken';
import { NewParticipation } from '../types/participation';

const URL = process.env.REACT_APP_API_URL;

export const createParticipation = async (participation: NewParticipation) => {
  return getAccessToken().then(async (accessToken) => {
    const response = await axios.post(`${URL}/participations`, participation, {
      headers: authHeader(accessToken),
    });
    return response.data;
  });
};

export const checkIfParticipates = async (eventId: number) => {
  return getAccessToken().then(async (accessToken) => {
    const response = await axios.post(
      `${URL}/participations/check`,
      { eventId: eventId },
      {
        headers: authHeader(accessToken),
      },
    );
    return response.data;
  });
};

export const getParticipationsByEvent = async (
  eventId: string,
  offset: number,
  limit: number,
) => {
  return getAccessToken().then(async (accessToken) => {
    const response = await axios.post(
      `${URL}/participations/search`,
      { eventId: eventId, offset: offset, limit: limit },
      {
        headers: authHeader(accessToken),
      },
    );
    return response.data;
  });
};

export const deleteParticipation = async (eventId: number) => {
  getAccessToken().then(async (accessToken) => {
    await axios.delete(`${URL}/participations/${eventId}`, {
      headers: authHeader(accessToken),
    });
  });
};

export const deleteAllEventParticipations = async (eventId: number) => {
  getAccessToken().then(async (accessToken) => {
    await axios.delete(`${URL}/participations/event/${eventId}`, {
      headers: authHeader(accessToken),
    });
  });
};
