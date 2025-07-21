const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "tiktok",
    alias: ["ttdl", "tt", "tiktokdl"],
    desc: "Download TikTok video without watermark",
    category: "downloader",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, args, q, reply }) => {
    try {
        if (!q) return reply("❗ Please provide a TikTok video link.\nUsage: *.tiktok https://www.tiktok.com/...*");
        if (!q.includes("tiktok.com")) return reply("🚫 Invalid TikTok link.");

        reply("⏳ Downloading video, please wait...");

        const apiUrl = `https://delirius-apiofc.vercel.app/download/tiktok?url=${q}`;
        const { data } = await axios.get(apiUrl);

        if (!data.status || !data.data) return reply("⚠️ Failed to fetch TikTok video.");

        const { title, like, comment, share, author, meta } = data.data;
        const videoUrl = meta.media.find(v => v.type === "video")?.org;

        if (!videoUrl) return reply("⚠️ Video URL not found in response.");

        const caption = `
╭━━〔 *🎵TIKTOK DOWNLOADER* 〕━━◆
┃ 👤 *User:* ${author.nickname} (@${author.username})
┃ 🎬 *Title:* ${title}
┃ ❤️ *Likes:* ${like}
┃ 💬 *Comments:* ${comment}
┃ 🔁 *Shares:* ${share}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━◆
        `.trim();

        await conn.sendMessage(from, {
            video: { url: videoUrl },
            caption,
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
        console.error("Error in TikTok downloader command:", e);
        reply(`❌ An error occurred: ${e.message}`);
    }
});
