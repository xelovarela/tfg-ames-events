/**
 * Pruebas de validacion de audiencias.
 * Comprueban nombres, edades opcionales y coherencia entre edad mínima y máxima.
 */
import { buildAudiencePayload, validateAudience } from './audienceValidation';

describe('audienceValidation: reglas para rangos de edad', () => {
  test('acepta una audiencia sin límites de edad cuando el nombre es válido', () => {
    expect(validateAudience({ name: 'Público general', age_min: '', age_max: '' })).toBeNull();
    expect(buildAudiencePayload({ name: ' Público general ', age_min: '', age_max: '' }))
      .toEqual({ name: 'Público general', age_min: null, age_max: null });
  });

  test('rechaza audiencias sin nombre o con nombre demasiado largo', () => {
    expect(validateAudience({ name: '   ', age_min: '', age_max: '' }))
      .toBe('El nombre es obligatorio y debe tener entre 1 y 100 caracteres.');
    expect(validateAudience({ name: 'a'.repeat(101), age_min: '', age_max: '' }))
      .toBe('El nombre es obligatorio y debe tener entre 1 y 100 caracteres.');
  });

  test('rechaza edades no enteras para evitar rangos ambiguos', () => {
    expect(validateAudience({ name: 'Juvenil', age_min: '12.5', age_max: '17' }))
      .toBe('La edad mínima debe ser un número entero.');
    expect(validateAudience({ name: 'Juvenil', age_min: '12', age_max: 'diecisiete' }))
      .toBe('La edad máxima debe ser un número entero.');
  });

  test('rechaza rangos incompletos cuando falta edad mínima o máxima', () => {
    expect(validateAudience({ name: 'Infantil', age_min: '0', age_max: '' }))
      .toBe('Debes indicar edad mínima y máxima juntas.');
    expect(validateAudience({ name: 'Infantil', age_min: '', age_max: '12' }))
      .toBe('Debes indicar edad mínima y máxima juntas.');
  });

  test('rechaza edades negativas y rangos donde la mínima supera la máxima', () => {
    expect(validateAudience({ name: 'Infantil', age_min: '-1', age_max: '12' }))
      .toBe('Rango de edad inválido.');
    expect(validateAudience({ name: 'Juvenil', age_min: '18', age_max: '12' }))
      .toBe('Rango de edad inválido.');
  });
});
