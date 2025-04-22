const path = require('path');
const fs = require('fs');

const soalList = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/quiz.json')));
const activeQuiz = {};

async function quizHandler(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  if (activeQuiz[from]) {
    return sock.sendMessage(from, { text: '❗Masih ada kuis yang belum dijawab!' }, { quoted: msg });
  }

  const soal = soalList[Math.floor(Math.random() * soalList.length)];
  const pilihan = soal.pilihan.map((p, i) => `${String.fromCharCode(65 + i)}. ${p}`).join('\n');
  const correctLetter = String.fromCharCode(65 + soal.pilihan.indexOf(soal.jawaban)); 

  activeQuiz[from] = {
    jawaban: correctLetter.toLowerCase(),
    timeout: setTimeout(() => {
      delete activeQuiz[from];
      sock.sendMessage(from, { text: `⏰ Waktu habis!\nJawaban: *${soal.jawaban}* (${correctLetter})` });
    }, 30000)
  };

  await sock.sendMessage(from, {
    text: `🧠 Kuis: ${soal.soal}\n\n${pilihan}\n\n⏳ Jawab dengan huruf: A / B / C`,
  }, { quoted: msg });
}

function handleQuizAnswer(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const text = msg.message?.conversation?.toLowerCase();

  if (!activeQuiz[from] || !text) return;

  if (['a', 'b', 'c'].includes(text)) {
    if (text === activeQuiz[from].jawaban) {
      clearTimeout(activeQuiz[from].timeout);
      delete activeQuiz[from];
      return sock.sendMessage(from, { text: `✅ Jawaban benar! Selamat @${sender.split('@')[0]} 🎉`, mentions: [sender] }, { quoted: msg });
    } else {
      sock.sendMessage(from, { text: `❌ Jawaban salah! Coba lagi.` }, { quoted: msg });
    }
  }
}

module.exports = {
  command: quizHandler,
  checkAnswer: handleQuizAnswer
};
