async function hidetagHandler(sock, msg, args) {
    const { remoteJid: from, participant } = msg.key;
    const groupMetadata = await sock.groupMetadata(from);
    const isGroup = from.endsWith('@g.us');
    const sender = msg.key.participant || msg.key.remoteJid;
    const text = args.join(' ');
  
    if (!isGroup) {
      return sock.sendMessage(from, { text: '❌ Perintah ini hanya bisa digunakan di grup.' }, { quoted: msg });
    }
  
    const groupAdmins = groupMetadata.participants
      .filter(p => p.admin !== null)
      .map(p => p.id);
  
    const isAdmin = groupAdmins.includes(sender);
  
    if (!isAdmin) {
      return sock.sendMessage(from, { text: '❌ Hanya admin yang bisa menggunakan perintah ini.' }, { quoted: msg });
    }
  
    if (!text) {
      return sock.sendMessage(from, { text: '⚠️ Format salah. Gunakan: *.hidetag pesan*' }, { quoted: msg });
    }
  
    const mentions = groupMetadata.participants.map(p => p.id);
  
    await sock.sendMessage(from, {
      text: text,
      mentions,
    }, { quoted: msg });
  }
  
  module.exports = hidetagHandler;
  