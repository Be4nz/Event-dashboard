export const formatTimeString = (date: string) => {
  return new Date(date).toLocaleString(navigator.language, {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (date: Date) => {
  return date.toLocaleString(navigator.language, {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateString = (date: string) => {
  return new Date(date).toLocaleString(navigator.language, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
};

export const formatDate = (date: Date) => {
  return date.toLocaleString(navigator.language, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
};

export const compareTimes = (date1: Date, date2: Date) => {
  date1 = new Date(date1.toISOString());
  date2 = new Date(date2.toISOString());
  const time1 = new Date(0, 0, 0, date1.getHours(), date1.getMinutes(), 0);
  const time2 = new Date(0, 0, 0, date2.getHours(), date2.getMinutes(), 0);

  if (time1.getTime() > time2.getTime()) {
    return 1;
  } else if (time1.getTime() < time2.getTime()) {
    return -1;
  } else {
    return 0;
  }
};

//assigns the specified time to the specified date variable
export const setTime = (date: Date, time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  date.setHours(hours);
  date.setMinutes(minutes);
  return date;
};
