const cron = require('node-cron');
const moment = require('moment-timezone');
const { PrayerTimes, Coordinates, CalculationMethod } = require('adhan');

const lokasi = {
  latitude: -6.2, 
  longitude: 106.816666,
  timezone: 'Asia/Jakarta'
};

const method = CalculationMethod.MuslimWorldLeague();
method.madhab = 'Shafi';

const labels = {
  fajr: '🕕 Subuh',
  dhuhr: '🕛 Dzuhur',
  asr: '🕒 Ashar',
  maghrib: '🌇 Maghrib',
  isha: '🌃 Isya'
};

function schedulePrayerReminder(sock, targetGroupJid) {
  cron.schedule('*/1 * * * *', async () => {
    const date = new Date();
    const prayerTimes = new PrayerTimes(new Coordinates(lokasi.latitude, lokasi.longitude), date, method);
    const now = moment().tz(lokasi.timezone).format('HH:mm');

    for (const [key, label] of Object.entries(labels)) {
      const time = moment(prayerTimes[key]).tz(lokasi.timezone).format('HH:mm');
      if (now === time) {
        const text = `🔔 Waktu ${label} telah tiba.\nAyo kita sholat! 🙏`;
        await sock.sendMessage(targetGroupJid, { text });
      }
    }
  });
}

module.exports = schedulePrayerReminder;
