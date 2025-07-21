const { cmd } = require('../command');
const os = require("os");
const process = require("process");

// Uptime formatter
function fancyUptime(seconds) {
    seconds = Number(seconds);
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d ? d + 'd ' : ''}${h ? h + 'h ' : ''}${m ? m + 'm ' : ''}${s}s`.trim() || "0s";
}

cmd({
    pattern: "alive",
    alias: ["av", "runtime", "uptime"],
    desc: "Check uptime and system status",
    category: "main",
    react: "📟",
    filename: __filename
},
async (conn, mek, m, { from, reply, botNumber, pushname }) => {
    try {
        const platform = "Heroku Platform";
        const release = os.release();
        const cpuModel = os.cpus()[0].model;
        const totalMem = (os.totalmem() / 1024 / 1024).toFixed(2);
        const usedMem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const cpuCores = os.cpus().length;
        const arch = os.arch();
        const nodeVersion = process.version;
        const botName = pushname || "POPKID BOT";
        const owner = "PopkidXtech";

        // Bold heading using Unicode bold characters
        const header = `✨🌌 𝗡𝗢𝗩𝗔-𝗫𝗠𝗗 𝐀𝐋𝐈𝐕𝐄 🚀✨`;

        const status = `
${header}

🤖 𝗕𝗼𝘁 𝗡𝗮𝗺𝗲   :: ${botName}
🆔 𝗕𝗼𝘁 𝗜𝗗     :: @${botNumber.replace(/@.+/, "")}
👑 𝗢𝘄𝗻𝗲𝗿      :: ${owner}

⏳ 𝗨𝗽𝘁𝗶𝗺𝗲      :: ${fancyUptime(process.uptime())}
💾 𝗥𝗔𝗠 Usage  :: ${usedMem} MB / ${totalMem} MB
🖥️ 𝗣𝗹𝗮𝘁𝗳𝗼𝗿𝗺  :: ${platform} (v${release}) [${arch}]
⚙️ 𝗖𝗣𝗨        :: ${cpuModel} (${cpuCores} cores)
🟢 𝗡𝗼𝗱𝗲 𝗩𝗲𝗿𝘀𝗶𝗼𝗻  :: ${nodeVersion}
🧪 𝗩𝗲𝗿𝘀𝗶𝗼𝗻    :: 1.0.0 BETA

───────────────
▶️ Stay tuned for more updates!
        `;

        const newsletterContext = {
            mentionedJid: [m.sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363382023564830@newsletter",
                newsletterName: "𝘕𝘖𝘝𝘈 𝘟𝘔𝘋",
                serverMessageId: 143
            }
        };

        // Send image with bold header
        await conn.sendMessage(from, {
            image: { url: "https://files.catbox.moe/0cp68j.jpg" },
            caption: status,
            contextInfo: newsletterContext
        }, { quoted: mek });

        // Send voice note
        await conn.sendMessage(from, {
            audio: { url: "https://files.catbox.moe/5df4ei.m4v" },
            mimetype: "audio/mp4",
            ptt: true,
            contextInfo: newsletterContext
        }, { quoted: mek });

    } catch (e) {
        console.error("Error in alive command:", e);
        reply(`🚨 *An error occurred:* ${e.message}`);
    }
});
