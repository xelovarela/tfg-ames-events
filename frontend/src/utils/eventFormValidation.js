/**
 * Validacion del formulario de eventos.
 * Reune reglas de campos obligatorios, precios y fechas antes de enviar al backend.
 */
import { parseEventDate } from './eventTime';

function validateEventForm(formData, { isDuplicating = false, rejectPastDate = true, now = new Date() } = {}) {
  // La duplicacion puede relajar algunas reglas para permitir reutilizar eventos existentes.
  const trimmedTitle = formData.title.trim();
  if (!trimmedTitle || !formData.category_id || !formData.location_id) {
    return 'Completa todos los campos obligatorios.';
  }

  if (isDuplicating && !formData.event_date) {
    return 'Elige una nueva fecha para confirmar la duplicacion.';
  }

  if (formData.event_date) {
    const eventDate = parseEventDate(formData.event_date);
    if (!eventDate) {
      return 'La fecha del evento no es valida.';
    }

    if (rejectPastDate && eventDate < now) {
      return 'No se puede crear un evento en una fecha pasada.';
    }
  }

  const isFree = Number(formData.is_free) === 1;
  const price = formData.price === '' ? null : Number(formData.price);

  if (!isFree && (price === null || Number.isNaN(price) || price <= 0)) {
    return 'Para eventos de pago debes indicar un precio mayor que 0.';
  }

  return null;
}

export { validateEventForm };
