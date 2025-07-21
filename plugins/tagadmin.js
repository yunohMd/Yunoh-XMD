const settings = require('../settings');
const { cmd } = require('../command');
const { getGroupAdmins } = require('../lib/functions');

cmd({
  pattern: "tagadmins",
  alias: ["gc_tagadmins"],
  react: "👑",
  desc: "Tag all admins in the group",
  category: "group",
  use: ".tagadmins [message]",
  filename: __filename
}, async (conn, mek, m, { from, participants, reply, isGroup, senderNumber, command, body }) => {
  try {
    if (!isGroup) return reply("❌ This command can only be used in groups.");

    const botOwner = conn.user.id.split(":")[0];
    const senderJid = senderNumber + "@s.whatsapp.net";

    const groupInfo = await conn.groupMetadata(from).catch(() => null);
    if (!groupInfo) return reply("❌ Failed to fetch group info.");

    const groupName = groupInfo.subject || "Unnamed Group";
    const admins = await getGroupAdmins(participants);
    if (!admins.length) return reply("❌ No admins found.");

    const emojis = ['👑', '⚡', '🌟', '✨', '🎖️', '💎', '🔱', '🛡️', '🚀', '🏆'];
    const randEmoji = emojis[Math.floor(Math.random() * emojis.length)];

    const msgText = body.slice(body.indexOf(command) + command.length).trim() || "📢 Calling all admins!";
    let text = `╔═══════════════╗
║   👑 *ADMIN CALL*   ║
╚═══════════════╝

🏷️ *Group:* ${groupName}
👤 *Admins:* ${admins.length}
🗣️ *Message:* ${msgText}

${admins.map((a, i) => `${randEmoji} @${a.split("@")[0]}`).join("\n")}

━━━━━━━━━━━━━━
🔰 *nova tech Bot* 🔰`;

    await conn.sendMessage(from, {
      text,
      mentions: admins,
      contextInfo: {
        mentionedJid: [m.sender],
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
    console.error("TagAdmins Error:", e);
    reply(`❌ *Error Occurred:*\n${e.message || e}`);
  }
});
