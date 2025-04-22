const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const { Canvas } = require('skia-canvas');

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';

  for (let word of words) {
    const testLine = line + word + ' ';
    const width = ctx.measureText(testLine).width;
    if (width > maxWidth && line) {
      lines.push(line);
      line = word + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line);
  return lines;
}

async function stikerHandler(sock, msg, commandArgs) {
  const { remoteJid } = msg;
  const text = commandArgs.join(' ');

  if (!text) {
    return sock.sendMessage(remoteJid, { text: '⚠️ Format salah. Gunakan: *.stiker teksnya*' }, { quoted: msg });
  }

  const canvas = new Canvas(512, 512);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#f8f8f0'; 
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = '60px sans-serif'; 
  ctx.fillStyle = '#000'; 
  ctx.textAlign = 'center';

  let lines = wrapText(ctx, text, 450);
  while (lines.length * 60 > 480 && 60 > 20) {
    ctx.font = `${60 - 5}px sans-serif`; 
    lines = wrapText(ctx, text, 450);
  }

  lines.forEach((line, i) => {
    ctx.fillText(line.trim(), canvas.width / 2, 150 + i * 60);
  });

  const buffer = canvas.toBuffer('image/png');

  const sticker = new Sticker(buffer, {
    pack: 'StikerBot',
    author: 'ZydnaBot',
    type: StickerTypes.FULL,
    quality: 70,
  });

  const stickerBuffer = await sticker.toBuffer();
  await sock.sendMessage(remoteJid, { sticker: stickerBuffer }, { quoted: msg });
}

module.exports = stikerHandler;
