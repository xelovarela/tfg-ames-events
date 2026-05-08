import { sortAudiencesByAge } from './audiences';

describe('audiences: ordenacion del catalogo de publicos', () => {
  test('coloca "Todos" al principio y despues ordena por edad minima y maxima', () => {
    const result = sortAudiencesByAge([
      { name: 'Adultos', age_min: 18, age_max: 99 },
      { name: 'Todos', age_min: null, age_max: null },
      { name: 'Infantil', age_min: 0, age_max: 12 },
      { name: 'Juvenil', age_min: 13, age_max: 17 }
    ]);

    expect(result.map((audience) => audience.name)).toEqual([
      'Todos',
      'Infantil',
      'Juvenil',
      'Adultos'
    ]);
  });

  test('mantiene el array original sin mutarlo al ordenar', () => {
    const audiences = [
      { name: 'Adultos', age_min: 18, age_max: 99 },
      { name: 'Infantil', age_min: 0, age_max: 12 }
    ];

    sortAudiencesByAge(audiences);

    expect(audiences.map((audience) => audience.name)).toEqual(['Adultos', 'Infantil']);
  });

  test('usa el nombre como desempate cuando dos audiencias comparten rango', () => {
    const result = sortAudiencesByAge([
      { name: 'B', age_min: 10, age_max: 12 },
      { name: 'A', age_min: 10, age_max: 12 }
    ]);

    expect(result.map((audience) => audience.name)).toEqual(['A', 'B']);
  });
});
