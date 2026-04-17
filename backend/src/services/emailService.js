const nodemailer = require('nodemailer');

const DEFAULT_APP_BASE_URL = 'http://localhost:3000';

function parseBoolean(value) {
  return value === 'true' || value === '1';
}

function getVerificationUrl(token) {
  const baseUrl = process.env.APP_BASE_URL || DEFAULT_APP_BASE_URL;
  return `${baseUrl}/verify-email?token=${encodeURIComponent(token)}`;
}

function getPasswordResetUrl(token) {
  const baseUrl = process.env.APP_BASE_URL || DEFAULT_APP_BASE_URL;
  return `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;
}

function getEventUrl(eventId) {
  const baseUrl = process.env.APP_BASE_URL || DEFAULT_APP_BASE_URL;
  return `${baseUrl}/events/${encodeURIComponent(eventId)}`;
}

function formatEventDate(value) {
  if (!value) {
    return 'Sin fecha';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Sin fecha';
  }

  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function createTransporterIfConfigured() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = parseBoolean(process.env.SMTP_SECURE || 'false');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    }
  });
}

async function sendVerificationEmail({ to, name, token }) {
  const verificationUrl = getVerificationUrl(token);
  const transporter = createTransporterIfConfigured();
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@ames-events.local';
  const subject = 'Verifica tu correo - Ames Events';
  const text = [
    `Hola ${name || 'usuario'},`,
    '',
    'Gracias por registrarte en Ames Events.',
    'Para activar tu cuenta, verifica tu correo en este enlace:',
    verificationUrl,
    '',
    'Si no solicitaste esta cuenta, ignora este mensaje.'
  ].join('\n');
  const html = `
    <p>Hola ${name || 'usuario'},</p>
    <p>Gracias por registrarte en Ames Events.</p>
    <p>
      Para activar tu cuenta, verifica tu correo en este enlace:
      <a href="${verificationUrl}">${verificationUrl}</a>
    </p>
    <p>Si no solicitaste esta cuenta, ignora este mensaje.</p>
  `;

  if (!transporter) {
    // En desarrollo sin SMTP se registra el enlace para poder probar el flujo.
    console.warn(`[emailService] SMTP no configurado. Link de verificacion para ${to}: ${verificationUrl}`);
    return { delivered: false, verificationUrl };
  }

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html
  });

  return { delivered: true, verificationUrl };
}

async function sendPasswordResetEmail(user, token) {
  const resetUrl = getPasswordResetUrl(token);
  const transporter = createTransporterIfConfigured();
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@ames-events.local';
  const to = user.email;
  const name = user.username || user.name || 'usuario';
  const subject = 'Restablece tu contrasena - Ames Events';
  const safeName = escapeHtml(name);
  const safeResetUrl = escapeHtml(resetUrl);
  const text = [
    `Hola ${name},`,
    '',
    'Hemos recibido una solicitud para restablecer tu contrasena en Ames Events.',
    'Puedes crear una nueva contrasena usando este enlace:',
    resetUrl,
    '',
    'El enlace caduca en 1 hora.',
    'Si no solicitaste este cambio, ignora este mensaje.'
  ].join('\n');
  const html = `
    <p>Hola ${safeName},</p>
    <p>Hemos recibido una solicitud para restablecer tu contrasena en Ames Events.</p>
    <p>
      Puedes crear una nueva contrasena usando este enlace:
      <a href="${safeResetUrl}">${safeResetUrl}</a>
    </p>
    <p>El enlace caduca en 1 hora.</p>
    <p>Si no solicitaste este cambio, ignora este mensaje.</p>
  `;

  if (!transporter) {
    console.warn(`[emailService] SMTP no configurado. Link de recuperacion para ${to}: ${resetUrl}`);
    return { delivered: false, resetUrl };
  }

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html
  });

  return { delivered: true, resetUrl };
}

async function sendEventAlertEmail({ to, name, alertName, event }) {
  const eventUrl = getEventUrl(event.id);
  const transporter = createTransporterIfConfigured();
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@ames-events.local';
  const subject = `Nuevo evento para tu alerta: ${event.title}`;
  const eventDate = formatEventDate(event.event_date);
  const location = event.location || 'Ubicacion no especificada';
  const safeName = escapeHtml(name || 'usuario');
  const safeAlertName = escapeHtml(alertName);
  const safeEventTitle = escapeHtml(event.title);
  const safeEventDate = escapeHtml(eventDate);
  const safeLocation = escapeHtml(location);
  const safeEventUrl = escapeHtml(eventUrl);
  const text = [
    `Hola ${name || 'usuario'},`,
    '',
    `Tu alerta "${alertName}" coincide con un nuevo evento en Ames Events.`,
    '',
    `Evento: ${event.title}`,
    `Fecha: ${eventDate}`,
    `Ubicacion: ${location}`,
    '',
    `Puedes ver el detalle aqui: ${eventUrl}`
  ].join('\n');
  const html = `
    <p>Hola ${safeName},</p>
    <p>Tu alerta <strong>${safeAlertName}</strong> coincide con un nuevo evento en Ames Events.</p>
    <ul>
      <li><strong>Evento:</strong> ${safeEventTitle}</li>
      <li><strong>Fecha:</strong> ${safeEventDate}</li>
      <li><strong>Ubicacion:</strong> ${safeLocation}</li>
    </ul>
    <p><a href="${safeEventUrl}">Ver detalle del evento</a></p>
  `;

  if (!transporter) {
    console.warn(`[emailService] SMTP no configurado. Alerta "${alertName}" para ${to}: ${eventUrl}`);
    return { delivered: false, eventUrl };
  }

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html
  });

  return { delivered: true, eventUrl };
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendEventAlertEmail,
  getVerificationUrl,
  getPasswordResetUrl,
  getEventUrl
};
