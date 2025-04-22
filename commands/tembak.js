const { proto } = require('@whiskeysockets/baileys');

module.exports = async function tembak(sock, msg, args) {
  const { remoteJid, message } = msg;
  const mention = message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

  if (!mention) {
    return sock.sendMessage(remoteJid, {
      text: '❌ Format salah. Gunakan: *.tembak @tag*',
    }, { quoted: msg });
  }

  const contentText = `💘 ${msg.pushName} menyatakan perasaan kepada kamu!\n\nApakah kamu menerima?`;

  await sock.sendMessage(remoteJid, {
    text: contentText,
    mentions: [mention],
    footer: 'Pilih jawaban kamu dengan tombol di bawah ini.',
    templateButtons: [
      { index: 1, quickReplyButton: { displayText: '✅ Diterima', id: `tembak_diterima_${mention}` } },
      { index: 2, quickReplyButton: { displayText: '❌ Ditolak', id: `tembak_ditolak_${mention}` } },
    ],
  }, { quoted: msg });
};
