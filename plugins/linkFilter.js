const { allowedDomains } = require('../config');

module.exports = async (sock, m, text) => {
  const sender = m.key.participant || m.key.remoteJid;

  const regex = /(https?:\/\/[^\s]+)/g;
  const links = text.match(regex);

  if (links) {
    for (let link of links) {
      const domainAllowed = allowedDomains.some(domain => link.includes(domain));
      if (!domainAllowed) {
        await sock.sendMessage(m.key.remoteJid, { text: `❌ Link dilarang: ${link}` }, { quoted: m });
        await sock.groupParticipantsUpdate(m.key.remoteJid, [sender], 'remove');
        break;
      }
    }
  }
};
