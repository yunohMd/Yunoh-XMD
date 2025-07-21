const settings = require('../settings');
const { cmd } = require('../command');

const cooldowns = new Map();

// ✅ Stylish tagall command for admins and owner
cmd({
  pattern: "tagall",
  alias: ["gc_tagall"],
  react: "🔊",
  desc: "Mention all group members",
  category: "group",
  use: ".tagall [your message]",
  filename: __filename
}, async (conn, mek, m, {
  from,
  participants,
  reply,
  isGroup,
  senderNumber,
  groupAdmins,
  prefix,
  command
}) => {
  try {
    if (!isGroup) return reply("❌ *This command can only be used in groups!*");

    const botOwner = conn.user.id.split(":")[0];
    const senderJid = senderNumber + "@s.whatsapp.net";

    if (!groupAdmins.includes(senderJid) && senderNumber !== botOwner)
      return reply("🚫 *Only group admins or bot owner can use this command.*");

    if (participants.length > 250)
      return reply("🚫 *Group too large to mention all members (limit: 250).*");

    // ⏳ Cooldown check
    const lastUsed = cooldowns.get(from);
    const now = Date.now();
    const cooldown = 10 * 1000;
    if (lastUsed && now - lastUsed < cooldown)
      return reply(`⏳ *Please wait ${Math.ceil((cooldown - (now - lastUsed)) / 1000)}s before using again.*`);
    cooldowns.set(from, now);

    const metadata = await conn.groupMetadata(from);
    const groupName = metadata.subject || "Group";
    const memberCount = participants.length;

    const msgText = (m.body || "").slice((prefix + command).length).trim() || "🚨 *Attention everyone!*";

    const emojis = ["⚡", "🚀", "🛡️", "📢", "🎯", "🔥", "🎉", "💬", "🗯️", "🔔"];
    const icon = emojis[Math.floor(Math.random() * emojis.length)];

    const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    let caption = `╭── 🎯 *Group Broadcast* ──⬣\n│\n`;
    caption += `├ 🏷️ *Group:* ${groupName}\n`;
    caption += `├ 👥 *Members:* ${memberCount}\n`;
    caption += `├ 🗨️ *Message:* ${msgText}\n`;
    caption += `├ ⏱️ *Time:* ${time}\n│\n`;
    caption += `╰───⟪ 𝙈𝙚𝙣𝙩𝙞𝙤𝙣𝙨 ⟫───⬣\n`;

    for (const user of participants) {
      if (user?.id === conn.user.id) continue;
      caption += `${icon} @${user.id.split('@')[0]}\n`;
    }

    caption += `\n🎖️ *Powered by NOVA XMD*`;

    await conn.sendMessage(from, {
      text: caption,
      mentions: participants.map(u => u.id),
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363382023564830@newsletter",
          newsletterName: "NOVA XMD",
          serverMessageId: 143
        }
      }
    }, { quoted: mek });

  } catch (e) {
    console.error("TagAll Error:", e);
    reply("❌ An error occurred while tagging.");
  }
});


// ✅ Owner-only tag command for private broadcast
cmd({
  pattern: "tag",
  desc: "Bot owner broadcast to all members",
  category: "group",
  use: ".tag <message>",
  react: "📣",
  filename: __filename
}, async (conn, mek, m, {
  from,
  senderNumber,
  participants,
  q,
  reply
}) => {
  try {
    const botOwner = conn.user.id.split(":")[0];
    if (senderNumber !== botOwner)
      return reply("⛔ *Only nova (bot owner) can use this command.*");

    if (!q) return reply("ℹ️ *Please enter a message to broadcast.*");

    const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    const msg = `╭─💌 *Owner Broadcast*\n│\n`;
    msg += `├ 🧑 *From:* @${senderNumber}\n`;
    msg += `├ 🗨️ *Message:* ${q}\n`;
    msg += `├ ⏱️ *Time:* ${time}\n│\n`;
    msg += `╰─🎯 *Mentions Below*`;

    await conn.sendMessage(from, {
      text: msg,
      mentions: participants.map(u => u.id),
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363382023564830@newsletter",
          newsletterName: "NOVA XMD",
          serverMessageId: 143
        }
      }
    }, { quoted: mek });

  } catch (e) {
    console.error("Tag Error:", e);
    reply("❌ An error occurred while sending the tag.");
  }
});
