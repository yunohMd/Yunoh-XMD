const { cmd } = require("../command");

cmd({
  pattern: "send",
  alias: ["sendme", "save"],
  react: "📤",
  desc: "Forward/reply back the quoted message",
  category: "utility",
  filename: __filename,
}, async (conn, mek, m, { from }) => {
  try {
    if (!m.quoted) {
      return await conn.sendMessage(from, {
        text: "*🍁 Please reply to an image, video, or audio message to use this command!*"
      }, { quoted: m });
    }

    const quoted = m.quoted;
    const buffer = await quoted.download();
    const mtype = quoted.mtype;
    const options = { quoted: m };

    let content;

    switch (mtype) {
      case "imageMessage":
        content = {
          image: buffer,
          caption: quoted.text || "",
          mimetype: quoted.mimetype || "image/jpeg"
        };
        break;

      case "videoMessage":
        content = {
          video: buffer,
          caption: quoted.text || "",
          mimetype: quoted.mimetype || "video/mp4"
        };
        break;

      case "audioMessage":
        content = {
          audio: buffer,
          mimetype: "audio/mp4",
          ptt: quoted.ptt || false
        };
        break;

      default:
        return await conn.sendMessage(from, {
          text: "❌ *Unsupported message type.*\n\n_Only image, video, and audio messages are supported._"
        }, options);
    }

    // Updated newsletter ID used here
    content.contextInfo = {
      forwardedNewsletterMessageInfo: {
        newsletterJid: "120363382023564830@newsletter",
        newsletterName: "NOVA XMD 🚘"
      }
    };

    await conn.sendMessage(from, content, options);

  } catch (err) {
    console.error("Send Command Error:", err);
    await conn.sendMessage(from, {
      text: `❌ *Error while forwarding the message.*\n\n_Error:_ ${err.message}`
    }, { quoted: m });
  }
});
