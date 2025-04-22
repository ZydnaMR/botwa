const { Canvas, loadImage } = require('skia-canvas');
const moment = require('moment-timezone');

function formatDuration(durationMs) {
  const duration = moment.duration(durationMs);
  const days = duration.days();
  const hours = duration.hours();
  const minutes = duration.minutes();
  return `${days} hari, ${hours} jam, ${minutes} menit`;
}

async function generateExitCard(name, ppBuffer, joinTime) {
  const width = 800;
  const height = 400;
  const canvas = new Canvas(width, height);
  const ctx = canvas.getContext('2d');

  const now = Date.now();
  const durasi = formatDuration(now - joinTime);

  ctx.fillStyle = '#fff3f3';
  ctx.fillRect(0, 0, width, height);

  try {
    const avatar = await loadImage(ppBuffer);
    ctx.drawImage(avatar, 50, 100, 150, 150);
  } catch (e) {
    console.error('❌ Gagal load avatar:', e);
  }

  ctx.fillStyle = '#c0392b';
  ctx.font = '28px "Poppins", sans-serif';
  ctx.fillText('👋 Sayonara!', 230, 80);

  ctx.font = '24px "Poppins", sans-serif';
  const displayName = name.length > 18 ? name.slice(0, 15) + '…' : name;
  ctx.fillText(`@${displayName}`, 230, 120);
  ctx.fillText(`Durasi gabung: ${durasi}`, 230, 170);

  ctx.font = '22px "Poppins", sans-serif';
  ctx.fillText('Semoga sukses di luar sana! ✨', 230, 230);

  return await canvas.toBuffer('png');
}

module.exports = generateExitCard;
