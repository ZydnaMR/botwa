const path = require('path');
const fs = require('fs');

const kataList = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/tebakkata.json')));

const activeGames = {};

function acakKata(kata) {
  return kata.split('').sort(() => Math.random() - 0.5).join('');
}

async function tebakkataHandler(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  if (activeGames[from]) {
    return sock.sendMessage(from, { text: '⏳ Masih ada soal sebelumnya yang belum dijawab!' }, { quoted: msg });
  }

  const kata = kataList[Math.floor(Math.random() * kataList.length)];
  const acak = acakKata(kata);

  activeGames[from] = {
    jawaban: kata.toLowerCase(),
    timeout: setTimeout(() => {
      delete activeGames[from];
      sock.sendMessage(from, { text: `⏰ Waktu habis! Jawabannya adalah: *${kata}*` });
    }, 30 * 1000) 
  };

  await sock.sendMessage(from, {
    text: `🎮 Tebak kata berikut:\n\n*${acak}*\n\n⏳ Kamu punya 30 detik! Jawab langsung tanpa titik.`,
  }, { quoted: msg });
}

function handleJawabanTebakkata(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const text = msg.message?.conversation?.toLowerCase();

  if (!text || !activeGames[from]) return;

  const jawabanBenar = activeGames[from].jawaban;

  if (text === jawabanBenar) {
    clearTimeout(activeGames[from].timeout);
    delete activeGames[from];
    sock.sendMessage(from, { text: `✅ Jawaban benar! Selamat <@${sender.split('@')[0]}> 🎉`, mentions: [sender] }, { quoted: msg });
  }
}

module.exports = {
  command: tebakkataHandler,
  checkAnswer: handleJawabanTebakkata
};
