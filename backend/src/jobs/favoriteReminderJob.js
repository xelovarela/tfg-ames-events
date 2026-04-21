const favoriteRemindersService = require('../services/favoriteRemindersService');

const DEFAULT_RUN_TIME = '09:00';
const DAY_IN_MS = 24 * 60 * 60 * 1000;

function parseBoolean(value) {
  return value === 'true' || value === '1';
}

function parseRunTime(value) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value || DEFAULT_RUN_TIME);

  if (!match) {
    return parseRunTime(DEFAULT_RUN_TIME);
  }

  return {
    hour: Number(match[1]),
    minute: Number(match[2])
  };
}

function getDelayUntilNextRun(runTime) {
  const now = new Date();
  const nextRun = new Date(now);
  nextRun.setHours(runTime.hour, runTime.minute, 0, 0);

  if (nextRun <= now) {
    nextRun.setDate(nextRun.getDate() + 1);
  }

  return nextRun.getTime() - now.getTime();
}

async function runFavoriteReminderJob() {
  const result = await favoriteRemindersService.sendFavoriteRemindersForDate();
  console.log(
    `[favoriteReminderJob] Fecha objetivo ${result.targetDate}. Revisados: ${result.checked}. Enviados: ${result.sent}. Fallidos: ${result.failed}.`
  );
}

function startFavoriteReminderJob() {
  if (!parseBoolean(process.env.FAVORITE_REMINDERS_ENABLED || 'false')) {
    console.log('[favoriteReminderJob] Recordatorios de favoritos desactivados.');
    return null;
  }

  const runTime = parseRunTime(process.env.FAVORITE_REMINDERS_RUN_TIME || DEFAULT_RUN_TIME);

  const scheduleNextRun = () => {
    const delay = getDelayUntilNextRun(runTime);

    return setTimeout(async () => {
      try {
        await runFavoriteReminderJob();
      } catch (error) {
        console.error('[favoriteReminderJob] Error ejecutando recordatorios:', error);
      } finally {
        scheduleNextRun();
      }
    }, delay);
  };

  console.log(
    `[favoriteReminderJob] Recordatorios de favoritos activos. Hora diaria: ${String(runTime.hour).padStart(2, '0')}:${String(runTime.minute).padStart(2, '0')}.`
  );

  return scheduleNextRun();
}

module.exports = {
  startFavoriteReminderJob,
  runFavoriteReminderJob,
  parseRunTime,
  getDelayUntilNextRun,
  DAY_IN_MS
};
