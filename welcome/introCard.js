const { Canvas, loadImage } = require('skia-canvas');

async function generateIntroCard(name, ppBuffer) {
  const width = 800;
  const height = 400;
  const canvas = new Canvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, width, height);

  try {
    const avatar = await loadImage(ppBuffer);
    ctx.save();
    ctx.beginPath();
    ctx.arc(125, 175, 75, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 50, 100, 150, 150);
    ctx.restore();
  } catch (e) {
    console.error('❌ Gagal load avatar:', e);
  }

  ctx.fillStyle = '#333';
  ctx.font = 'bold 30px "Poppins", sans-serif';
  ctx.fillText('👋 Selamat Datang!', 230, 80);

  ctx.font = '24px "Poppins", sans-serif';
  const displayName = name.length > 18 ? name.slice(0, 15) + '…' : name;
  ctx.fillText(`@${displayName}`, 230, 120);
  ctx.fillText('Nama: __________________', 230, 170);
  ctx.fillText('Umur: __________________', 230, 210);
  ctx.fillText('Asal: __________________', 230, 250);

  ctx.font = '22px "Poppins", sans-serif';
  ctx.fillText('Salam kenal semuanya 😊', 230, 300);

  return await canvas.toBuffer('png');
}

module.exports = generateIntroCard;
