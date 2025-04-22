const stringSimilarity = require('string-similarity');
const responses = {
  'halo': 'Hallo juga!',
  'hai': 'Hai juga!',
  'p': 'Ucapkan salam!',
  'apakah kamu manusia?': 'Tidak, saya adalah robot',
  '.menu': 'Disini tidak ada list menu kakak!',
  'admin': 'Disini asisten admin siap membantu',
  'bot siapa namamu': 'Aku ZydnaBot 🤖',
  'terimakasih': 'Sama-sama 😊',
  'assalamualaikum': 'Waalaikumussalam 🙏'
};

module.exports = async (sock, m, text) => {
  const keys = Object.keys(responses);
  const match = stringSimilarity.findBestMatch(text.toLowerCase(), keys);

  if (match.bestMatch.rating >= 0.7) {
    await sock.sendMessage(m.key.remoteJid, { text: responses[match.bestMatch.target] }, { quoted: m });
  }
};
