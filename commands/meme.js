const axios = require('axios');

module.exports = async function meme(sock, msg) {
  const from = msg.key.remoteJid;

  try {
    const res = await axios.get('https://www.reddit.com/r/memes/random/.json', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    const post = res.data[0].data.children[0].data;

    if (post.post_hint !== 'image') {
      return await sock.sendMessage(from, { text: '⚠️ Gagal mengambil meme, coba lagi.' }, { quoted: msg });
    }

    const imageUrl = post.url;
    const title = post.title;

    const memeBuffer = await axios.get(imageUrl, { responseType: 'arraybuffer' });

    await sock.sendMessage(
      from,
      {
        image: Buffer.from(memeBuffer.data, 'binary'),
        caption: `🤣 *${title}*\n\n📥 From Reddit r/memes`,
      },
      { quoted: msg }
    );
  } catch (err) {
    console.error('Error ambil meme:', err);
    await sock.sendMessage(from, { text: '❌ Gagal mengambil meme, coba lagi nanti.' }, { quoted: msg });
  }
};
