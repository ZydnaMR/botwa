module.exports = async function fakta(sock, msg) {
  const from = msg.key.remoteJid;

  try {
    const res = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en');
    const englishFact = res.data.text;

    const translated = await translate(englishFact, { to: 'id' });

    const teks = `📌 *Fakta Random*:\n\n_${translated.text}_`;

    await sock.sendMessage(from, { text: teks }, { quoted: msg });
  } catch (err) {
    console.error('Error ambil fakta:', err);
    await sock.sendMessage(from, { text: '❌ Gagal mengambil fakta, coba lagi nanti.' }, { quoted: msg });
  }
};
