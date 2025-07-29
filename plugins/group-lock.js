const config = require('../config');
const { cmd } = require('../command');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('../lib/functions');

// Verified contact
const quotedContact = {
    key: {
        fromMe: false,
        participant: `0@s.whatsapp.net`,
        remoteJid: "status@broadcast"
    },
    message: {
        contactMessage: {
            displayName: "B.M.B VERIFIED ✅",
            vcard: "BEGIN:VCARD\nVERSION:3.0\nFN:B.M.B VERIFIED ✅\nORG:BMB-TECH BOT;\nTEL;type=CELL;type=VOICE;waid=254769529791:+254769529791\nEND:VCARD"
        }
    }
};

cmd({
    pattern: "lockgc",
    alias: ["lock"],
    react: "🔒",
    desc: "Lock the group (Prevents new members from joining).",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply }) => {
    const contextInfo = {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: "120363382023564830@newsletter",
            newsletterName: "𝙽𝙾𝚅𝙰-𝚇𝙼𝙳",
            serverMessageId: 1
        }
    };

    try {
        if (!isGroup) return reply(`
╭───「 *ERROR* 」───╮
│ ❌ This command is for groups only.
╰──────────────────╯
        `.trim(), { quoted: quotedContact, contextInfo });

        if (!isAdmins) return reply(`
╭───「 *ACCESS DENIED* 」───╮
│ 🚫 Only group admins can use this command.
╰──────────────────────────╯
        `.trim(), { quoted: quotedContact, contextInfo });

        if (!isBotAdmins) return reply(`
╭───「 *BOT ERROR* 」───╮
│ ❌ I need to be an admin to lock the group.
╰────────────────────────╯
        `.trim(), { quoted: quotedContact, contextInfo });

        await conn.groupSettingUpdate(from, "locked");

        reply(`
╭───「 *SUCCESS* 」───╮
│ 🔒 Group has been *locked*.
│ 🔐 Only *admins* can send messages now.
╰────────────────────╯
        `.trim(), { quoted: quotedContact, contextInfo });

    } catch (e) {
        console.error("Error locking group:", e);
        reply(`
╭───「 *ERROR* 」───╮
│ ❌ Failed to lock the group.
│ 💬 Reason: ${e.message}
╰──────────────────╯
        `.trim(), { quoted: quotedContact, contextInfo });
    }
});
