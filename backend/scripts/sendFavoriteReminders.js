const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const favoriteRemindersService = require('../src/services/favoriteRemindersService');

async function main() {
  const targetDate = process.argv[2];
  const result = await favoriteRemindersService.sendFavoriteRemindersForDate(targetDate);

  console.log(
    `[favorite-reminders] Fecha objetivo ${result.targetDate}. Revisados: ${result.checked}. Enviados: ${result.sent}. Omitidos: ${result.skipped}. Fallidos: ${result.failed}.`
  );

  if (result.failed > 0 || result.skipped > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error('[favorite-reminders] Error ejecutando recordatorios:', error);
    process.exitCode = 1;
  })
  .finally(() => {
    setTimeout(() => process.exit(process.exitCode || 0), 0);
  });
