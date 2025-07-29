const axios = require("axios");
const { cmd } = require("../command");
const { sleep } = require('../lib/functions');

// Quoted contact for newsletter context
const quotedContact = {
  key: {
    fromMe: false,
    participant: `0@s.whatsapp.net`,
    remoteJid: "status@broadcast"
  },
  message: {
    contactMessage: {
      displayName: "B.M.B VERIFIED ✅",
      vcard: "BEGIN:VCARD\nVERSION:3.0\nFN:B.M.B VERIFIED ✅\nORG:BMB-TECH BOT;\nTEL;type=CELL;type=VOICE;waid=255767862457:+255767862457\nEND:VCARD"
    }
  }
};

cmd({
  pattern: "screenshot",
  react: "🌐",
  alias: ["ss", "ssweb"],
  desc: "Capture a full-page screenshot of a website.",
  category: "utility",
  use: ".screenshot <url>",
  filename: __filename,
}, async (conn, mek, msg, { from, args, reply }) => {
  try {
    const url = args[0];
    if (!url) return reply("❌ Please provide a URL\nExample: .screenshot https://google.com");
    if (!url.startsWith("http")) return reply("❌ URL must start with http:// or https://");

    const contextInfo = {
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: "120363382023564830@newsletter",
        newsletterName: "𝙽𝙾𝚅𝙰-𝚇𝙼𝙳",
        serverMessageId: 33
      }
    };

    await reply("🔄 Taking screenshot... Please wait", { quoted: quotedContact });

    await sleep(1500);

    await conn.sendMessage(from, {
      image: { url: `https://image.thum.io/get/fullpage/${url}` },
      caption: "- 🖼️ *Screenshot Generated*\n\n> Its nova say it beiby🤭🎭♥️🧎",
      contextInfo
    }, { quoted: quotedContact });

  } catch (error) {
    console.error("Screenshot Error:", error);
    await conn.sendMessage(from, {
      text: "❌ Failed to capture screenshot\n✦ Please try again later",
      contextInfo
    }, { quoted: quotedContact });
  }
});
