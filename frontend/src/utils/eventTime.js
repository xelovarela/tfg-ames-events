const LOCAL_DATE_TIME_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)$/;

function parseEventDate(value) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'string') {
    const match = value.trim().match(LOCAL_DATE_TIME_PATTERN);
    if (match) {
      const [, yearValue, monthValue, dayValue, hourValue, minuteValue, secondValue] = match;
      const year = Number(yearValue);
      const month = Number(monthValue);
      const day = Number(dayValue);
      const hour = hourValue === undefined ? 0 : Number(hourValue);
      const minute = minuteValue === undefined ? 0 : Number(minuteValue);
      const second = secondValue === undefined ? 0 : Number(secondValue);
      const parsed = new Date(year, month - 1, day, hour, minute, second);

      if (
        parsed.getFullYear() !== year ||
        parsed.getMonth() !== month - 1 ||
        parsed.getDate() !== day ||
        parsed.getHours() !== hour ||
        parsed.getMinutes() !== minute ||
        parsed.getSeconds() !== second
      ) {
        return null;
      }

      return parsed;
    }
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isPastEvent(event, now = new Date()) {
  if (event?.is_past !== undefined && event?.is_past !== null) {
    return Number(event.is_past) === 1 || event.is_past === true;
  }

  if (!event?.event_date) {
    return false;
  }

  const eventDate = parseEventDate(event.event_date);
  if (!eventDate) {
    return false;
  }

  return eventDate < now;
}

function splitEventsByTimeState(events) {
  const upcoming = [];
  const past = [];

  (Array.isArray(events) ? events : []).forEach((event) => {
    if (isPastEvent(event)) {
      past.push(event);
      return;
    }

    upcoming.push(event);
  });

  return { upcoming, past };
}

export { isPastEvent, parseEventDate, splitEventsByTimeState };
