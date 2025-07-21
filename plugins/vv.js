const { cmd } = require("../command");

cmd({
  pattern: "vv",
  alias: ["viewonce", 'retrive'],
  react: '👾',
  desc: "Owner Only - retrieve quoted message back to user",
  category: "owner",
  filename: __filename
}, async (client, message, match, { from, isOwner }) => {
  try {
    if (!isOwner) {
      return await client.sendMessage(from, {
        text: "*📛 This is an owner command.*"
      }, { quoted: message });
    }

    if (!match.quoted) {
      return await client.sendMessage(from, {
        text: "*🍁 Please reply to a view once message!*"
      }, { quoted: message });
    }

    const buffer = await match.quoted.download();
    const mtype = match.quoted.mtype;
    const caption = match.quoted.text || '';
    const mimetype = match.quoted.mimetype;
    const isPtt = match.quoted.ptt || false;

    let messageContent = {};
    switch (mtype) {
      case "imageMessage":
        messageContent = {
          image: buffer,
          caption,
          mimetype: mimetype || "image/jpeg"
        };
        break;
      case "videoMessage":
        messageContent = {
          video: buffer,
          caption,
          mimetype: mimetype || "video/mp4"
        };
        break;
      case "audioMessage":
        messageContent = {
          audio: buffer,
          mimetype: "audio/mp4",
          ptt: isPtt
        };
        break;
      default:
        return await client.sendMessage(from, {
          text: "❌ Only image, video, and audio messages are supported"
        }, { quoted: message });
    }

    // Add fake newsletter forwarding style
    const newsletterInfo = {
      mentionedJid: [message.sender],
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363382023564830@newsletter',
        newsletterName: '𝘕𝘖𝘝𝘈 𝘟𝘔𝘋',
        serverMessageId: 143
      }
    };

    await client.sendMessage(from, {
      ...messageContent,
      contextInfo: newsletterInfo
    }, { quoted: message });

  } catch (error) {
    console.error("vv Error:", error);
    await client.sendMessage(from, {
      text: "❌ Error fetching vv message:\n" + error.message
    }, { quoted: message });
  }
});
