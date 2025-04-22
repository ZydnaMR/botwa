const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const axios = require('axios');
const chalk = require('chalk');
const handler = require('./lib/handler');
const commands = require('./commands');
const userJoinTimes = new Map(); 
const setupOnMessage = require('./events/onMessage');
const schedulePrayerReminder = require('./schedule/schedulePrayerReminder');
const { prayerGroupJid } = require('./config');
const scheduleGroupOpenClose = require('./schedule/scheduleGroupOpenClose');
const { isRateLimited } = require('./lib/rateLimiter');

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    auth: state,
    browser: ['ZydnaBot', 'Chrome', '23.0'],
  });

  handler.loadAll(sock);

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect.error = new Boom(lastDisconnect?.error))?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) startBot();
    } else if (connection === 'open') {
      console.log('✅ Bot connected!');
    }
  });

  setupOnMessage(sock);

  schedulePrayerReminder(sock, prayerGroupJid);

  scheduleGroupOpenClose(sock, prayerGroupJid);

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    const msg = messages[0];
    if (!msg.message || msg.key?.remoteJid === 'status@broadcast') return;

    const from = msg.key.remoteJid;
    const isGroup = from.endsWith('@g.us');
    const sender = isGroup ? msg.key.participant : msg.key.remoteJid;
    const displayName = msg.pushName || sender.split('@')[0];
    const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
    const prefix = '.';

    if (msg.message?.buttonResponseMessage) {
      const btnId = msg.message.buttonResponseMessage.selectedButtonId;
      const responder = msg.key.participant || msg.key.remoteJid;
      const sender = msg.key.participant || msg.key.remoteJid;
      const from = msg.key.remoteJid;
    
      if (btnId.startsWith('tembak_')) {
        const [_, aksi, target] = btnId.split('_');
    
        if (responder !== target) {
          return sock.sendMessage(from, {
            text: '🚫 Kamu tidak bisa menjawab tembakan ini!',
          }, { quoted: msg });
        }
    
        let responseText = '';
        if (aksi === 'diterima') {
          responseText = `🎉 Selamat! Kamu dan ${displayName} sekarang resmi jadian! 💞`;
        } else if (aksi === 'ditolak') {
          responseText = `😢 Semangat ya ${displayName}, mungkin belum jodoh!`;
        } else {
          return;
        }
    
        await sock.sendMessage(from, {
          text: responseText,
        }, { quoted: msg });
    
        return;
      }
    }        

    if (!body.startsWith(prefix)) return;

    const args = body.slice(1).trim().split(/ +/);
    const cmd = args.shift().toLowerCase();

    if (isRateLimited(sender)) {
      return sock.sendMessage(from, {
        text: '⏱️ Kamu terlalu sering mengirim perintah. Coba lagi nanti!',
      }, { quoted: msg });
    }

    if (commands[cmd]) {
      try {
        await commands[cmd](sock, msg, args);
      } catch (err) {
        console.error(chalk.red('[CMD ERROR]'), err);
      }
    }

    commands.tebakkata.checkAnswer(sock, msg);

    commands.quiz.checkAnswer(sock, msg);

    commands.tebakangka.checkAnswer(sock, msg);

    if (cmd === 'idgrup') {
      if (!isGroup) {
        return sock.sendMessage(from, { text: '❌ Perintah ini hanya bisa digunakan di grup.' }, { quoted: msg });
      }
  
      const metadata = await sock.groupMetadata(from);
      const groupName = metadata.subject;
  
      return sock.sendMessage(from, {
        text: `📛 *Nama Grup:* ${groupName}\n🆔 *ID Grup:* ${from}`,
      }, { quoted: msg });
    }
  });

  const generateIntroCard = require('./welcome/introCard');
  const generateExitCard = require('./welcome/exitCard');

sock.ev.on('group-participants.update', async (update) => {
  const { id, participants, action } = update;

  if (action === 'add') {
    for (let user of participants) {
      userJoinTimes.set(user, Date.now());
      try {
        const username = user.split('@')[0];
        const ppUrl = await sock.profilePictureUrl(user, 'image').catch(() => null);
        const ppBuffer = ppUrl
          ? (await axios.get(ppUrl, { responseType: 'arraybuffer' })).data
          : (await axios.get('https://i.ibb.co/2kR5zq0/default-avatar.png', { responseType: 'arraybuffer' })).data;

        const card = await generateIntroCard(username, ppBuffer);

        await sock.sendMessage(id, {
          image: card,
          caption: `📌 *Perkenalkan anggota baru!*\nSilakan isi: Nama, Umur, dan Asalmu yaa!`,
        });
      } catch (err) {
        console.error('❌ Error saat kirim intro card:', err);
      }
    }
  }

  if (action === 'remove') {
    for (let user of participants) {
      try {
        const username = user.split('@')[0];
        const ppUrl = await sock.profilePictureUrl(user, 'image').catch(() => null);
        const ppBuffer = ppUrl
          ? (await axios.get(ppUrl, { responseType: 'arraybuffer' })).data
          : (await axios.get('https://i.ibb.co/2kR5zq0/default-avatar.png', { responseType: 'arraybuffer' })).data;

        const joinTime = userJoinTimes.get(user) || (Date.now() - 3600000); 
        const card = await generateExitCard(username, ppBuffer, joinTime);

        await sock.sendMessage(id, {
          image: card,
          caption: `📤 Member telah keluar dari grup.`,
        });

        userJoinTimes.delete(user);
      } catch (err) {
        console.error('❌ Error saat kirim exit card:', err);
      }
    }
  }
  });
  
}

startBot();
