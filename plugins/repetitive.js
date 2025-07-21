const settings = require('../settings');
const { cmd, commands } = require('../command');

cmd({
    pattern: "msg",
    desc: "🔁 Send a message multiple times (Owner Only)",
    category: "utility",
    react: "🔁",
    filename: __filename
},
async (conn, mek, m, { from, reply, isCreator, q, sender }) => {
    if (!isCreator) return reply('🚫 *This command is for the bot owner only!*');

    try {
        // Require input like: .msg text,count
        if (!q.includes(',')) {
            return reply(`❗ *Incorrect Format:*\nUse: .msg message,count\n\n*Example:*\n.msg Hello Fam!, 5`);
        }

        let [message, countStr] = q.split(',');
        const count = parseInt(countStr.trim());

        if (isNaN(count) || count < 1 || count > 100) {
            return reply("⚠️ *Please enter a number between 1 and 100.*");
        }

        message = message.trim();
        if (!message) return reply("❗ Message cannot be empty.");

        // Stylish header preview
        await conn.sendMessage(from, {
            text: `📢 *Broadcasting:* "${message}"\n🔁 *Count:* ${count}x\n⌛ Sending in 2 seconds...`,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                mentionedJid: [sender],
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363382023564830@newsletter',
                    newsletterName: "NOVA XMD",
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 sec wait before spamming

        // Send repeatedly
        for (let i = 0; i < count; i++) {
            await conn.sendMessage(from, {
                text: message,
                contextInfo: {
                    forwardingScore: 999,
                    isForwarded: true,
                    mentionedJid: [sender],
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363382023564830@newsletter',
                        newsletterName: "NOVA XMD",
                        serverMessageId: 143
                    }
                }
            });
            if (i < count - 1) await new Promise(r => setTimeout(r, 500)); // 0.5s delay between
        }

    } catch (e) {
        console.error("Msg command error:", e);
        reply(`❌ *Error:* ${e.message}`);
    }
});
