const cron = require('node-cron');
const moment = require('moment-timezone');

function scheduleGroupOpenClose(sock, groupJid) {
  cron.schedule('0 4 * * *', async () => {
    const now = moment().tz('Asia/Jakarta').format('HH:mm');
    try {
      await sock.groupSettingUpdate(groupJid, 'not_announcement'); 
      await sock.sendMessage(groupJid, {
        text: `📢 Grup telah *dibuka* pada pukul ${now} WIB. Silakan mulai berdiskusi kembali!`
      });
    } catch (e) {
      console.error('[ERROR buka grup]', e);
    }
  });

  cron.schedule('0 22 * * *', async () => {
    const now = moment().tz('Asia/Jakarta').format('HH:mm');
    try {
      await sock.groupSettingUpdate(groupJid, 'announcement'); 
      await sock.sendMessage(groupJid, {
        text: `🔒 Grup telah *ditutup* pada pukul ${now} WIB. Sampai jumpa besok!`
      });
    } catch (e) {
      console.error('[ERROR tutup grup]', e);
    }
  });
}

module.exports = scheduleGroupOpenClose;
