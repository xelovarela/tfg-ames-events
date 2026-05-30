/**
 * Pruebas de las reglas de cuenta.
 * Cubren email, registro, nombre de usuario y cambio de contrasena.
 */
import {
  buildRegisterPayload,
  isValidEmail,
  validatePasswordChange,
  validateProfileUsername,
  validateRegisterForm
} from './accountValidation';

describe('accountValidation: registro, perfil y contrasenas', () => {
  test('acepta emails con formato valido y rechaza formatos incompletos', () => {
    expect(isValidEmail('persona@example.com')).toBe(true);
    expect(isValidEmail('persona@')).toBe(false);
    expect(isValidEmail('persona.example.com')).toBe(false);
  });

  test('normaliza el payload de registro antes de enviarlo a la API', () => {
    expect(buildRegisterPayload({
      username: '  admin  ',
      email: 'ADMIN@EXAMPLE.COM ',
      password: 'tfg2026!'
    })).toEqual({
      username: 'admin',
      email: 'admin@example.com',
      password: 'tfg2026!'
    });
  });

  test('rechaza registros con campos obligatorios vacios, email invalido o password corta', () => {
    expect(validateRegisterForm({ username: '', email: 'a@b.com', password: 'tfg2026!', confirmPassword: 'tfg2026!' }))
      .toBe('Todos los campos son obligatorios.');
    expect(validateRegisterForm({ username: 'ana', email: 'email-invalido', password: 'tfg2026!', confirmPassword: 'tfg2026!' }))
      .toBe('Debes introducir un email valido.');
    expect(validateRegisterForm({ username: 'ana', email: 'ana@example.com', password: 'corta', confirmPassword: 'corta' }))
      .toBe('La contraseña debe tener al menos 8 caracteres.');
  });

  test('rechaza registro o cambio de password cuando las contrasenas no coinciden', () => {
    expect(validateRegisterForm({ username: 'ana', email: 'ana@example.com', password: 'tfg2026!', confirmPassword: 'distinta' }))
      .toBe('Las contraseñas no coinciden.');
    expect(validatePasswordChange({ currentPassword: 'tfg2026', newPassword: 'tfg2026!', confirmPassword: 'distinta' }))
      .toBe('Las contraseñas no coinciden.');
  });

  test('valida cambios de perfil y password con los mismos limites de la interfaz', () => {
    expect(validateProfileUsername('   ')).toBe('El nombre de usuario no puede estar vacio.');
    expect(validateProfileUsername('ana')).toBeNull();
    expect(validatePasswordChange({ currentPassword: '', newPassword: 'tfg2026!', confirmPassword: 'tfg2026!' }))
      .toBe('Todos los campos de contraseña son obligatorios.');
    expect(validatePasswordChange({ currentPassword: 'actual', newPassword: 'corta', confirmPassword: 'corta' }))
      .toBe('La nueva contraseña debe tener al menos 8 caracteres.');
    expect(validatePasswordChange({ currentPassword: 'actual', newPassword: 'tfg2026!', confirmPassword: 'tfg2026!' }))
      .toBeNull();
  });
});
