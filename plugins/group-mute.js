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

// Context info with newsletter
const contextInfo = {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: "120363382023564830@newsletter",
        newsletterName: "𝙽𝙾𝚅𝙰-𝚇𝙼𝙳",
        serverMessageId: 1
    }
};

// 🔇 Mute Command
cmd({
    pattern: "mute",
    alias: ["groupmute"],
    react: "🔇",
    desc: "Mute the group (Only admins can send messages).",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply }) => {
    try {
        if (!isGroup) return reply(`
╭───「 *ERROR* 」───╮
│ ❌ Group command only.
╰──────────────────╯
        `.trim(), { quoted: quotedContact, contextInfo });

        if (!isAdmins) return reply(`
╭───「 *ACCESS DENIED* 」───╮
│ 🚫 Only admins can mute the group.
╰──────────────────────────╯
        `.trim(), { quoted: quotedContact, contextInfo });

        if (!isBotAdmins) return reply(`
╭───「 *BOT ERROR* 」───╮
│ ❌ I must be admin to mute the group.
╰──────────────────────╯
        `.trim(), { quoted: quotedContact, contextInfo });

        await conn.groupSettingUpdate(from, "announcement");
        reply(`
╭───「 *SUCCESS* 」───╮
│ 🔇 Group has been *muted*.
│ Only *admins* can send messages.
╰────────────────────╯
        `.trim(), { quoted: quotedContact, contextInfo });
    } catch (e) {
        console.error("Mute error:", e);
        reply(`
╭───「 *ERROR* 」───╮
│ ❌ Failed to mute the group.
│ 💬 ${e.message}
╰──────────────────╯
        `.trim(), { quoted: quotedContact, contextInfo });
    }
});

// 🔊 Unmute Command
cmd({
    pattern: "unmute",
    alias: ["groupunmute"],
    react: "🔊",
    desc: "Unmute the group (Everyone can send messages).",
    category: "group",
    filename: __filename
},
async (conn, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply }) => {
    try {
        if (!isGroup) return reply(`
╭───「 *ERROR* 」───╮
│ ❌ Group command only.
╰──────────────────╯
        `.trim(), { quoted: quotedContact, contextInfo });

        if (!isAdmins) return reply(`
╭───「 *ACCESS DENIED* 」───╮
│ 🚫 Only admins can unmute the group.
╰──────────────────────────╯
        `.trim(), { quoted: quotedContact, contextInfo });

        if (!isBotAdmins) return reply(`
╭───「 *BOT ERROR* 」───╮
│ ❌ I must be admin to unmute the group.
╰────────────────────────╯
        `.trim(), { quoted: quotedContact, contextInfo });

        await conn.groupSettingUpdate(from, "not_announcement");
        reply(`
╭───「 *SUCCESS* 」───╮
│ 🔊 Group has been *unmuted*.
│ Everyone can send messages.
╰─────────────────────╯
        `.trim(), { quoted: quotedContact, contextInfo });
    } catch (e) {
        console.error("Unmute error:", e);
        reply(`
╭───「 *ERROR* 」───╮
│ ❌ Failed to unmute the group.
│ 💬 ${e.message}
╰──────────────────╯
        `.trim(), { quoted: quotedContact, contextInfo });
    }
});
