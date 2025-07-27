const { cmd } = require('../command');

const quotedContact = {
    key: {
        fromMe: false,
        participant: `0@s.whatsapp.net`,
        remoteJid: "status@broadcast"
    },
    message: {
        contactMessage: {
            displayName: "B.M.B VERIFIED ✅",
            vcard: "BEGIN:VCARD\nVERSION:3.0\nFN:B.M.B VERIFIED ✅\nORG:BMB-TECH BOT;\nTEL;type=CELL;type=VOICE;waid=254769529791:254769529791\nEND:VCARD"
        }
    }
};

cmd({
    pattern: "demote",
    alias: ["d", "dismiss", "removeadmin"],
    desc: "Demotes a group admin to a normal member",
    category: "admin",
    react: "⬇️",
    filename: __filename
},
async (conn, mek, m, { from, q, isGroup, isAdmins, isBotAdmins, reply, botNumber, quoted, sender }) => {
    if (!isGroup) return reply(`
╭───「 *ERROR* 」───╮
│ ❌ This command can only be used in groups.
╰──────────────────╯
    `.trim(), { quoted: quotedContact, contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: "120363382023564830@newsletter",
            newsletterName: "𝙽𝙾𝚅𝙰-𝚇𝙼𝙳",
            serverMessageId: 1
        }
    } });

    if (!isAdmins) return reply(`
╭───「 *ACCESS DENIED* 」───╮
│ 🚫 Only group admins can use this command.
╰──────────────────────────╯
    `.trim(), { quoted: quotedContact, contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: "120363382023564830@newsletter",
            newsletterName: "𝙽𝙾𝚅𝙰-𝚇𝙼𝙳",
            serverMessageId: 1
        }
    } });

    if (!isBotAdmins) return reply(`
╭───「 *BOT ERROR* 」───╮
│ ⚠️ I need to be an admin to perform this action.
╰──────────────────────╯
    `.trim(), { quoted: quotedContact, contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: "120363382023564830@newsletter",
            newsletterName: "𝙽𝙾𝚅𝙰-𝚇𝙼𝙳",
            serverMessageId: 1
        }
    } });

    const normalizeJid = (input) => {
        if (!input) return null;
        if (input.includes("@")) return input.split("@")[0] + "@s.whatsapp.net";
        return input + "@s.whatsapp.net";
    };

    let number;
    if (quoted) {
        number = quoted.sender || quoted.key?.participant;
        number = number.split("@")[0];
    } else if (q && q.includes("@")) {
        number = q.replace(/[@\s]/g, '');
    } else if (q && /^\d+$/.test(q)) {
        number = q;
    } else {
        return reply(`
╭───「 *USAGE* 」───╮
│ ❌ Please reply to a user message or provide a number.
╰──────────────────╯
        `.trim(), { quoted: quotedContact, contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363382023564830@newsletter",
                newsletterName: "𝙽𝙾𝚅𝙰-𝚇𝙼𝙳",
                serverMessageId: 1
            }
        } });
    }

    if (number === botNumber.split("@")[0]) {
        return reply(`
╭───「 *ERROR* 」───╮
│ ❌ The bot cannot demote itself.
╰──────────────────╯
        `.trim(), { quoted: quotedContact, contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363382023564830@newsletter",
                newsletterName: "𝙽𝙾𝚅𝙰-𝚇𝙼𝙳",
                serverMessageId: 1
            }
        } });
    }

    const jid = normalizeJid(number);

    try {
        await conn.groupParticipantsUpdate(from, [jid], "demote");
        return reply(`
╭───「 *SUCCESS* 」───╮
│ ✅ Successfully demoted @${number} to a normal member.
╰────────────────────╯
        `.trim(), { 
            mentions: [jid],
            quoted: quotedContact,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363382023564830@newsletter",
                    newsletterName: "𝙽𝙾𝚅𝙰-𝚇𝙼𝙳",
                    serverMessageId: 1
                }
            }
        });
    } catch (error) {
        console.error("Demote command error:", error);
        return reply(`
╭───「 *ERROR* 」───╮
│ ❌ Failed to demote the member.
│ ${error?.message || "Unknown error."}
╰──────────────────╯
        `.trim(), { quoted: quotedContact, contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363382023564830@newsletter",
                newsletterName: "𝙽𝙾𝚅𝙰-𝚇𝙼𝙳",
                serverMessageId: 1
            }
        } });
    }
});
