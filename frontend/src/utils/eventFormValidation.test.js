import { validateEventForm } from './eventFormValidation';

const VALID_EVENT_FORM = {
  title: 'Taller creativo',
  description: '',
  event_date: '2026-05-09T18:00',
  is_free: '1',
  price: '',
  audience_id: '',
  organizer_id: '',
  category_id: '1',
  location_id: '2'
};

const NOW = new Date('2026-05-08T12:00:00');

describe('eventFormValidation: reglas para crear eventos', () => {
  test('acepta un evento gratuito con titulo, categoria, ubicacion y fecha futura', () => {
    expect(validateEventForm(VALID_EVENT_FORM, { now: NOW })).toBeNull();
  });

  test('rechaza eventos sin titulo, categoria o ubicacion obligatoria', () => {
    expect(validateEventForm({ ...VALID_EVENT_FORM, title: '   ' }, { now: NOW }))
      .toBe('Completa todos los campos obligatorios.');
    expect(validateEventForm({ ...VALID_EVENT_FORM, category_id: '' }, { now: NOW }))
      .toBe('Completa todos los campos obligatorios.');
    expect(validateEventForm({ ...VALID_EVENT_FORM, location_id: '' }, { now: NOW }))
      .toBe('Completa todos los campos obligatorios.');
  });

  test('rechaza duplicados sin nueva fecha para evitar copiar un evento incompleto', () => {
    expect(validateEventForm({ ...VALID_EVENT_FORM, event_date: '' }, { isDuplicating: true, now: NOW }))
      .toBe('Elige una nueva fecha para confirmar la duplicacion.');
  });

  test('rechaza fechas invalidas antes de enviar el formulario a la API', () => {
    expect(validateEventForm({ ...VALID_EVENT_FORM, event_date: 'no-es-fecha' }, { now: NOW }))
      .toBe('La fecha del evento no es valida.');
  });

  test('rechaza crear eventos con una fecha anterior al momento actual', () => {
    expect(validateEventForm({ ...VALID_EVENT_FORM, event_date: '2026-05-08T11:59' }, { now: NOW }))
      .toBe('No se puede crear un evento en una fecha pasada.');
  });

  test('permite desactivar el veto de fecha pasada para editar eventos existentes', () => {
    expect(validateEventForm(
      { ...VALID_EVENT_FORM, event_date: '2026-05-08T11:59' },
      { rejectPastDate: false, now: NOW }
    )).toBeNull();
  });

  test('rechaza eventos de pago sin precio positivo', () => {
    expect(validateEventForm({ ...VALID_EVENT_FORM, is_free: '0', price: '' }, { now: NOW }))
      .toBe('Para eventos de pago debes indicar un precio mayor que 0.');
    expect(validateEventForm({ ...VALID_EVENT_FORM, is_free: '0', price: '0' }, { now: NOW }))
      .toBe('Para eventos de pago debes indicar un precio mayor que 0.');
  });
});
