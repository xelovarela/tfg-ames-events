import { parseEventDate } from './eventTime';

describe('eventTime: parseo local de fechas de evento', () => {
  test('interpreta DATETIME de MySQL como hora local sin aplicar UTC', () => {
    const parsed = parseEventDate('2026-05-19 23:00:00');

    expect(parsed).not.toBeNull();
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(4);
    expect(parsed.getDate()).toBe(19);
    expect(parsed.getHours()).toBe(23);
    expect(parsed.getMinutes()).toBe(0);
  });

  test('rechaza fechas locales imposibles', () => {
    expect(parseEventDate('2026-02-31 10:00:00')).toBeNull();
  });
});
