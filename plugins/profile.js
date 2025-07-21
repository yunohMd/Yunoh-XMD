const { cmd } = require('../command');
const { getBuffer } = require('../lib/functions');

cmd({
    pattern: "person",
    react: "👤",
    alias: ["userinfo", "profile"],
    desc: "Get complete user profile information",
    category: "utility",
    use: '.person [@tag or reply]',
    filename: __filename
},
async (conn, mek, m, { from, sender, isGroup, reply, quoted, participants }) => {
    try {
        let userJid = quoted?.sender || 
                      mek.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                      sender;

        const [user] = await conn.onWhatsApp(userJid).catch(() => []);
        if (!user?.exists) return reply("❌ User not found on WhatsApp.");

        let ppUrl;
        try {
            ppUrl = await conn.profilePictureUrl(userJid, 'image');
        } catch {
            ppUrl = 'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png';
        }

        let userName = userJid.split('@')[0];
        try {
            if (isGroup) {
                const member = participants.find(p => p.id === userJid);
                if (member?.notify) userName = member.notify;
            }

            if (conn.contactDB) {
                const contact = await conn.contactDB.get(userJid).catch(() => null);
                if (contact?.name) userName = contact.name;
            }

            const presence = await conn.presenceSubscribe(userJid).catch(() => null);
            if (presence?.pushname) userName = presence.pushname;

        } catch (e) {
            console.log("Name fetch error:", e);
        }

        let bio = {};
        try {
            const statusData = await conn.fetchStatus(userJid).catch(() => null);
            if (statusData?.status) {
                bio = {
                    text: statusData.status,
                    type: "Personal",
                    updated: statusData.setAt ? new Date(statusData.setAt * 1000) : null
                };
            } else {
                const business = await conn.getBusinessProfile(userJid).catch(() => null);
                if (business?.description) {
                    bio = {
                        text: business.description,
                        type: "Business",
                        updated: null
                    };
                }
            }
        } catch (e) {
            console.log("Bio fetch error:", e);
        }

        const groupRole = isGroup
            ? (participants.find(p => p.id === userJid)?.admin ? "👑 Admin" : "👥 Member")
            : "";

        const formattedBio = bio.text 
            ? `╰─ ✦ *${bio.type} Bio*${bio.updated ? ` • 🕒 ${bio.updated.toLocaleString()}` : ''}\n${bio.text}`
            : "╰─ ✦ *Bio:* Not available";

        const caption = `
*『 👤 USER PROFILE 』*

🧍 *Name:* ${userName}
📞 *Number:* ${userJid.replace(/@.+/, '')}
📊 *Type:* ${user.isBusiness ? "💼 Business" : user.isEnterprise ? "🏢 Enterprise" : "👤 Personal"}
${isGroup ? `👥 *Group Role:* ${groupRole}` : ""}
🛡 *Verified:* ${user.verifiedName ? "✅ Yes" : "❌ No"}
✅ *Registered:* ${user.isUser ? "Yes" : "No"}

*📝 About:*
${formattedBio}

⚡ *Nova Tech Tools*
        `.trim();

        await conn.sendMessage(from, {
            image: { url: ppUrl },
            caption,
            mentions: [userJid],
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                mentionedJid: [userJid],
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363382023564830@newsletter',
                    newsletterName: "NOVA XMD",
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Person command error:", e);
        reply(`❌ Error: ${e.message || "Failed to fetch profile"}`);
    }
});
