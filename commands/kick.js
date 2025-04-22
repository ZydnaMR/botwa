async function kickHandler(sock, msg, args) {
    const from = msg.key.remoteJid;
    const isGroup = from.endsWith('@g.us');
    const sender = msg.key.participant || msg.key.remoteJid;
  
    if (!isGroup) {
      return sock.sendMessage(from, { text: '❌ Perintah ini hanya bisa digunakan di grup.' }, { quoted: msg });
    }
  
    const groupMetadata = await sock.groupMetadata(from);
    const groupAdmins = groupMetadata.participants
      .filter(p => p.admin !== null)
      .map(p => p.id);
  
    const isAdmin = groupAdmins.includes(sender);
  
    if (!isAdmin) {
      return sock.sendMessage(from, { text: '❌ Hanya admin yang bisa menggunakan perintah ini.' }, { quoted: msg });
    }
  
    if (!msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.length) {
      return sock.sendMessage(from, { text: '⚠️ Tag pengguna yang ingin dikeluarkan.\nContoh: *.kick @tag*' }, { quoted: msg });
    }
  
    const target = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
  
    if (groupAdmins.includes(target)) {
      return sock.sendMessage(from, { text: '❌ Tidak bisa mengeluarkan sesama admin.' }, { quoted: msg });
    }
  
    try {
      await sock.groupParticipantsUpdate(from, [target], 'remove');
      await sock.sendMessage(from, { text: `👋 @${target.split('@')[0]} telah dikeluarkan dari grup.`, mentions: [target] }, { quoted: msg });
    } catch (err) {
      console.error(err);
      sock.sendMessage(from, { text: '❌ Gagal mengeluarkan anggota. Pastikan bot memiliki izin admin.' }, { quoted: msg });
    }
  }
  
  module.exports = kickHandler;
  