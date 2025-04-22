const axios = require('axios');
const translate = require('@vitalets/google-translate-api');

module.exports = async function motivasi(sock, msg) {
  const from = msg.key.remoteJid;

  try {
    const res = await axios.get('https://zenquotes.io/api/random');
    const quote = res.data[0];

    const translatedQuote = await translate(quote.q, { to: 'id' });
    const translatedAuthor = await translate(quote.a, { to: 'id' });

    const teks = `💡 *Motivasi Hari Ini:*\n\n_"${translatedQuote.text}"_\n\n- ${translatedAuthor.text}`;

    await sock.sendMessage(from, { text: teks }, { quoted: msg });
  } catch (err) {
    console.error('Error ambil motivasi:', err);
    await sock.sendMessage(from, { text: '❌ Gagal mengambil motivasi, coba lagi nanti.' }, { quoted: msg });
  }
};
