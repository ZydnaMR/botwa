const axios = require('axios');
const path = require('path');
const fs = require('fs');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const moment = require('moment');

async function musikHandler(sock, msg, args) {
  const text = args.join(' ');
  const from = msg.key.remoteJid;

  if (!text) {
    return sock.sendMessage(from, { text: '⚠️ Format salah. Gunakan: *.musik judul lagu*' }, { quoted: msg });
  }

  try {
    const res = await axios.get(`https://api.vhz.my.id/api/music/play?query=${encodeURIComponent(text)}`);
    const { result } = res.data;

    if (!result || !result.url) throw new Error('Lagu tidak ditemukan.');

    const infoText = `🎵 *Judul:* ${result.title}\n🕒 *Durasi:* ${result.duration}\n🔗 *Source:* YouTube`;

    const outputPath = path.join(__dirname, `../temp/${Date.now()}.mp3`);
    const stream = ytdl(result.url, { filter: 'audioonly' });

    await new Promise((resolve, reject) => {
      ffmpeg(stream)
        .audioBitrate(128)
        .save(outputPath)
        .on('end', resolve)
        .on('error', reject);
    });

    const audioBuffer = fs.readFileSync(outputPath);
    await sock.sendMessage(from, { audio: audioBuffer, mimetype: 'audio/mp4', ptt: false }, { quoted: msg });
    await sock.sendMessage(from, { text: infoText }, { quoted: msg });

    fs.unlinkSync(outputPath); 
  } catch (err) {
    console.error(err);
    sock.sendMessage(from, { text: '❌ Gagal memutar lagu. Pastikan judulnya benar.' }, { quoted: msg });
  }
}

module.exports = musikHandler;
