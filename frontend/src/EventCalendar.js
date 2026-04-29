import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { isPastEvent } from './utils/eventTime';
import './EventCalendar.css';

const WEEK_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MAX_VISIBLE_EVENTS_PER_DAY = 3;

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function toDateKey(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatEventTime(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatMonthLabel(date) {
  return date.toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric'
  });
}

function getCalendarDays(monthDate) {
  const firstDay = startOfMonth(monthDate);
  const firstGridDate = new Date(firstDay);
  const mondayBasedDay = (firstDay.getDay() + 6) % 7;
  firstGridDate.setDate(firstDay.getDate() - mondayBasedDay);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(firstGridDate);
    date.setDate(firstGridDate.getDate() + index);
    return date;
  });
}

function getCategoryColor(categoryName) {
  const source = String(categoryName || 'general');
  let hash = 0;

  for (let index = 0; index < source.length; index += 1) {
    hash = source.charCodeAt(index) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 58% 42%)`;
}

function EventCalendar({ events = [], emptyMessage = 'No hay eventos para mostrar en este mes.' }) {
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const todayKey = toDateKey(new Date());
  const visibleMonthKey = `${visibleMonth.getFullYear()}-${visibleMonth.getMonth()}`;

  const eventsByDate = useMemo(() => {
    const groupedEvents = new Map();

    events.forEach((event) => {
      const dateKey = toDateKey(event.event_date);
      if (!dateKey) {
        return;
      }

      const dayEvents = groupedEvents.get(dateKey) || [];
      dayEvents.push(event);
      groupedEvents.set(dateKey, dayEvents);
    });

    groupedEvents.forEach((dayEvents) => {
      dayEvents.sort((first, second) => new Date(first.event_date) - new Date(second.event_date));
    });

    return groupedEvents;
  }, [events]);

  const calendarDays = useMemo(() => getCalendarDays(visibleMonth), [visibleMonth]);
  const visibleMonthEventCount = calendarDays.reduce((count, day) => {
    if (`${day.getFullYear()}-${day.getMonth()}` !== visibleMonthKey) {
      return count;
    }

    return count + (eventsByDate.get(toDateKey(day))?.length || 0);
  }, 0);

  return (
    <section className="event-calendar-panel">
      <div className="event-calendar-header">
        <div>
          <p className="event-calendar-kicker">Calendario</p>
          <h3>{formatMonthLabel(visibleMonth)}</h3>
        </div>

        <div className="event-calendar-controls" aria-label="Navegación del calendario">
          <button type="button" onClick={() => setVisibleMonth(addMonths(visibleMonth, -1))} aria-label="Mes anterior">
            <ChevronLeft aria-hidden="true" focusable="false" />
          </button>
          <button type="button" onClick={() => setVisibleMonth(startOfMonth(new Date()))}>
            Hoy
          </button>
          <button type="button" onClick={() => setVisibleMonth(addMonths(visibleMonth, 1))} aria-label="Mes siguiente">
            <ChevronRight aria-hidden="true" focusable="false" />
          </button>
        </div>
      </div>

      <div className="event-calendar-weekdays" aria-hidden="true">
        {WEEK_DAYS.map((dayName) => (
          <span key={dayName}>{dayName}</span>
        ))}
      </div>

      <div className="event-calendar-grid">
        {calendarDays.map((day) => {
          const dateKey = toDateKey(day);
          const dayEvents = eventsByDate.get(dateKey) || [];
          const visibleEvents = dayEvents.slice(0, MAX_VISIBLE_EVENTS_PER_DAY);
          const hiddenEventCount = Math.max(dayEvents.length - MAX_VISIBLE_EVENTS_PER_DAY, 0);
          const isCurrentMonth = day.getMonth() === visibleMonth.getMonth();
          const isToday = dateKey === todayKey;

          return (
            <article
              key={dateKey}
              className={`event-calendar-day${isCurrentMonth ? '' : ' is-muted'}${isToday ? ' is-today' : ''}`}
            >
              <div className="event-calendar-day-number">
                <span>{day.getDate()}</span>
              </div>

              <div className="event-calendar-day-events">
                {visibleEvents.map((event) => {
                  const isPast = isPastEvent(event);
                  const time = formatEventTime(event.event_date);

                  return (
                    <Link
                      key={event.id}
                      to={`/events/${event.id}`}
                      className={`event-calendar-event${isPast ? ' is-past' : ''}`}
                      style={{ '--event-category-color': getCategoryColor(event.category) }}
                      title={event.title}
                    >
                      <span className="event-calendar-event-dot" aria-hidden="true" />
                      <span className="event-calendar-event-main">
                        {time && <small>{time}</small>}
                        <strong>{event.title}</strong>
                      </span>
                      {isPast && <em>Finalizado</em>}
                    </Link>
                  );
                })}

                {hiddenEventCount > 0 && (
                  <span className="event-calendar-more">+{hiddenEventCount} más</span>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {visibleMonthEventCount === 0 && (
        <p className="event-calendar-empty">{emptyMessage}</p>
      )}
    </section>
  );
}

export default EventCalendar;
