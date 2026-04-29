function isPastEvent(event, now = new Date()) {
  if (event?.is_past !== undefined && event?.is_past !== null) {
    return Number(event.is_past) === 1 || event.is_past === true;
  }

  if (!event?.event_date) {
    return false;
  }

  const eventDate = new Date(event.event_date);
  if (Number.isNaN(eventDate.getTime())) {
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

export { isPastEvent, splitEventsByTimeState };
