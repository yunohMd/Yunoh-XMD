const config = require('../settings');
const { cmd } = require('../command');
const { fetchJson } = require('../lib/functions');

cmd({
    pattern: "updategcname",
    alias: ["upgname", "gname"],
    react: "📝",
    desc: "Change the group name.",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, q, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        if (!isAdmins) return reply("❌ Only group admins can use this command.");
        if (!isBotAdmins) return reply("❌ I need admin rights to update the group name.");
        if (!q) return reply("📝 Please provide a new group name.\n\n*Example:* `.updategname New Group Name`");

        await conn.groupUpdateSubject(from, q);

        await conn.sendMessage(from, {
            text: `✅ Group name updated to:\n*${q}*`,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363382023564830@newsletter',
                    newsletterName: '𝘕𝘖𝘝𝘈 𝘟𝘔𝘋',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Error updating group name:", e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply("❌ Failed to update the group name. Please try again later.");
    }
});
