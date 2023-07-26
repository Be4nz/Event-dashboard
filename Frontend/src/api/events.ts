import axios from 'axios';
import { NewEventRequest, EventFilters, Event } from '../types/event';
import authHeader from '../auth/authHeader';
import { getAccessToken } from '../auth/getAccessToken';

const URL = process.env.REACT_APP_API_URL;

export const createEvent = async (event: NewEventRequest) => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return getAccessToken().then(async (accessToken) => {
    const formData = new FormData();
    formData.append('title', event.title);
    formData.append('type', event.type);
    formData.append('subtype', event.subtype || '');
    formData.append('description', event.description || '');
    formData.append('eventDate', event.eventDate);
    formData.append('registrationDeadline', event.registrationDeadline || '');
    formData.append('startTime', event.startTime || '');
    formData.append('endTime', event.endTime || '');
    formData.append('duration', event.duration ? String(event.duration) : '');
    formData.append('timeZone', timeZone);
    formData.append(
      'shareWith',
      event.shareWith ? event.shareWith.join(',') : '',
    );
    if (event.image) {
      formData.append('image', event.image);
    }

    const response = await axios.post(`${URL}/events`, formData, {
      headers: authHeader(accessToken),
    });
    return response.data;
  });
};

export const getEvent = async (id: number) => {
  return getAccessToken().then(async (accessToken) => {
    const response = await axios.get(`${URL}/events/${id}`, {
      headers: authHeader(accessToken),
    });
    return response.data;
  });
};

export const searchEvents = async (args: EventFilters) => {
  return getAccessToken().then(async (accessToken) => {
    const response = await axios.post(`${URL}/events/search`, args, {
      headers: authHeader(accessToken),
    });
    return response.data;
  });
};

export const searchMyEvents = async (args: EventFilters) => {
  return getAccessToken().then(async (accessToken) => {
    const response = await axios.post(`${URL}/events/search-my`, args, {
      headers: authHeader(accessToken),
    });
    return response.data;
  });
};

export const getImage = async (imageUrl: string) => {
  return getAccessToken().then(async (accessToken) => {
    const response = await axios.get(`${URL}/file/download/${imageUrl}`, {
      responseType: 'arraybuffer',
      headers: authHeader(accessToken),
    });
    return response.data;
  });
};

export const deleteEvent = async (id: number) => {
  return getAccessToken().then(async (accessToken) => {
    const response = await axios.delete(`${URL}/events/${id}`, {
      headers: authHeader(accessToken),
    });
    return response.data;
  });
};

export const restoreEvent = async (id: number) => {
  return getAccessToken().then(async (accessToken) => {
    const response = await axios.put(`${URL}/events/restore/${id}`, null, {
      headers: authHeader(accessToken),
    });
    return response.data;
  });
};

export const updateEvent = async (event: Event) => {
  const formData = new FormData();
  formData.append('title', event.title);
  formData.append('type', event.type);
  formData.append('subtype', event.subtype || '');
  formData.append('description', event.description || '');
  formData.append('eventDate', event.eventDate);
  formData.append('registrationDeadline', event.registrationDeadline || '');
  formData.append('startTime', event.startTime || '');
  formData.append('endTime', event.endTime || '');
  formData.append('duration', event.duration ? String(event.duration) : '');
  formData.append('deleted', String(false));
  if (event.image) {
    formData.append('image', event.image);
  }
  formData.append(
    'shareWith',
    event.shareWith ? event.shareWith.join(',') : '',
  );
  return getAccessToken().then(async (accessToken) => {
    const response = await axios.put(`${URL}/events/${event.id}`, formData, {
      headers: authHeader(accessToken),
    });
    return response.data;
  });
};

export const getAvailableTimes = async (eventId: number) => {
  return getAccessToken().then(async (accessToken) => {
    const response = await axios.get(`${URL}/events/${eventId}/times`, {
      headers: authHeader(accessToken),
    });
    return response.data;
  });
};

export const exportEventsToExcel = async (eventIds: number[]) => {
  return getAccessToken().then(async (accessToken) => {
    const response = await axios.post(
      `${URL}/events/export`,
      { eventIds: eventIds },
      {
        headers: authHeader(accessToken),
        responseType: 'blob',
      },
    );
    return response.data;
  });
};
