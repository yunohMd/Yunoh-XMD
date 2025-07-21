const config = require('../settings');
const { cmd } = require('../command');
const { fetchJson } = require('../lib/functions');

cmd({
    pattern: "revoke",
    alias: ["revokegrouplink", "resetgclink", "revokelink", "f_revoke"],
    desc: "Reset the group invite link",
    category: "group",
    react: "🖇️",
    use: ".revoke",
    filename: __filename
},
async (conn, mek, m, {
    from, isGroup, isAdmins, isBotAdmins, isDev, reply
}) => {
    try {
        const msr = (await fetchJson('https://raw.githubusercontent.com/devpopkid/POPKID-DATA/refs/heads/main/MSG/mreply.json')).replyMsg;

        if (!isGroup) return reply(msr.only_gp);
        if (!isAdmins && !isDev) return reply(msr.you_adm);
        if (!isBotAdmins) return reply(msr.give_adm);

        await conn.groupRevokeInvite(from);

        await conn.sendMessage(from, {
            text: '🔒 *Group link has been successfully reset!*',
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363382023564830@newsletter',
                    newsletterName: 'NOVA XMD',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error('Revoke error:', e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply(`❌ *Error Occurred!*\n\n\`\`\`${e.message || e}\`\`\``);
    }
});
