const nodemailer = require('nodemailer');

const DEFAULT_APP_BASE_URL = 'http://localhost:3000';

function parseBoolean(value) {
  return value === 'true' || value === '1';
}

function getVerificationUrl(token) {
  const baseUrl = process.env.APP_BASE_URL || DEFAULT_APP_BASE_URL;
  return `${baseUrl}/verify-email?token=${encodeURIComponent(token)}`;
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

module.exports = {
  sendVerificationEmail,
  getVerificationUrl
};
