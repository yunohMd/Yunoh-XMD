const config = require('../config')
const { cmd } = require('../command')
const { fetchJson } = require('../lib/functions')

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
    pattern: "ginfo",
    react: "🥏",
    alias: ["groupinfo"],
    desc: "Get group informations.",
    category: "group",
    use: '.ginfo',
    filename: __filename
},
async (conn, mek, m, {
    from,
    isGroup,
    isAdmins,
    isDev,
    isBotAdmins,
    reply,
    participants,
    mek
}) => {
    try {
        const msr = (await fetchJson('https://raw.githubusercontent.com/JawadTech3/KHAN-DATA/refs/heads/main/MSG/mreply.json')).replyMsg;

        if (!isGroup) return reply(msr.only_gp, { quoted: quotedContact });
        if (!isAdmins && !isDev) return reply(msr.you_adm, { quoted: mek });
        if (!isBotAdmins) return reply(msr.give_adm, { quoted: quotedContact });

        const ppUrls = [
            'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
        ];
        let ppUrl;
        try {
            ppUrl = await conn.profilePictureUrl(from, 'image');
        } catch {
            ppUrl = ppUrls[Math.floor(Math.random() * ppUrls.length)];
        }

        const metadata = await conn.groupMetadata(from);
        const groupAdmins = participants.filter(p => p.admin || p.isAdmin || p.role === 'admin');
        const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n');
        const owner = metadata.owner || "Unknown";

        const gdata = `
╭───「 *Group Information* 」───╮
│
│ Name: ${metadata.subject}
│ Jid: ${metadata.id}
│ Participants: ${metadata.size}
│ Creator: ${owner.split('@')[0]}
│ Description: ${metadata.desc ? metadata.desc : 'No description set.'}
│
│ Admins:
${listAdmin.split('\n').map(line => '│ ' + line).join('\n')}
╰───────────────────────────────╯
`;

        await conn.sendMessage(from, { image: { url: ppUrl }, caption: gdata }, { quoted: mek, contextInfo: { mentionedJid: groupAdmins.map(a => a.id) } });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply(`❌ *Error Occurred!!*\n\n${e}`, { quoted: mek });
    }
});
