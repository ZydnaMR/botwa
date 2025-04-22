const gameSessions = {};

function startTebakAngka(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  if (gameSessions[from]) {
    return sock.sendMessage(from, { text: '❗Masih ada game tebak angka yang belum selesai!' }, { quoted: msg });
  }

  const angka = Math.floor(Math.random() * 100) + 1;
  gameSessions[from] = {
    jawaban: angka,
    percobaan: 0,
    max: 5
  };

  return sock.sendMessage(from, { text: `🎯 Aku sudah memilih angka antara 1 sampai 100.\nTebak angkanya! Kamu punya 5 kesempatan.` }, { quoted: msg });
}

function handleTebakan(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const body = msg.message?.conversation?.trim();

  if (!gameSessions[from] || isNaN(body)) return;

  const angkaTebakan = parseInt(body);
  const session = gameSessions[from];
  session.percobaan++;

  if (angkaTebakan === session.jawaban) {
    delete gameSessions[from];
    return sock.sendMessage(from, {
      text: `🎉 Selamat @${sender.split('@')[0]}! Jawabanmu benar: *${angkaTebakan}*.\nTebakan ke-${session.percobaan}.`,
      mentions: [sender]
    }, { quoted: msg });
  }

  if (session.percobaan >= session.max) {
    const jawab = session.jawaban;
    delete gameSessions[from];
    return sock.sendMessage(from, {
      text: `❌ Kesempatanmu habis!\nJawaban yang benar adalah: *${jawab}*`,
    }, { quoted: msg });
  }

  let petunjuk = angkaTebakan < session.jawaban ? '🔼 Terlalu kecil!' : '🔽 Terlalu besar!';
  return sock.sendMessage(from, {
    text: `${petunjuk} (${session.percobaan}/${session.max} percobaan)`,
  }, { quoted: msg });
}

module.exports = {
  command: startTebakAngka,
  checkAnswer: handleTebakan
};
