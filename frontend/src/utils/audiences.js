/**
 * Utilidades de ordenación de públicos objetivo.
 * Dan prioridad al público general y después ordenan por rango de edad.
 */
function getAudienceOrderValue(audience) {
  if (audience?.name === 'Todos') {
    return -1;
  }

  const ageMin = audience?.age_min ?? 999;
  const ageMax = audience?.age_max ?? 999;
  return ageMin * 1000 + ageMax;
}

function sortAudiencesByAge(audiences) {
  return [...audiences].sort((first, second) => {
    const orderDiff = getAudienceOrderValue(first) - getAudienceOrderValue(second);
    if (orderDiff !== 0) {
      return orderDiff;
    }

    return String(first.name || '').localeCompare(String(second.name || ''), 'es');
  });
}

export { sortAudiencesByAge };
