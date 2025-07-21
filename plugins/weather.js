const axios = require('axios');
const settings = require('../settings');
const { cmd } = require('../command');

cmd({
    pattern: "weather",
    desc: "🌤 Get weather information for a location",
    react: "🌤",
    category: "other",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) {
            return reply("❗ Please provide a city name.\n\n📌 *Usage:* `.weather Nairobi`");
        }

        const apiKey = '2d61a72574c11c4f36173b627f8cb177'; 
        const city = q;
        const url = `http://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

        const { data } = await axios.get(url);

        const report = `
╭───⌈ 🌤️ *WEATHER REPORT* ⌋
├ 📍 *Location:* ${data.name}, ${data.sys.country}
├ 🌡️ *Temp:* ${data.main.temp}°C
├ 🤗 *Feels Like:* ${data.main.feels_like}°C
├ 📉 *Min Temp:* ${data.main.temp_min}°C
├ 📈 *Max Temp:* ${data.main.temp_max}°C
├ 💧 *Humidity:* ${data.main.humidity}%
├ 🌬️ *Wind Speed:* ${data.wind.speed} m/s
├ ☁️ *Weather:* ${data.weather[0].main}
├ 🔎 *Details:* ${data.weather[0].description}
├ 🔽 *Pressure:* ${data.main.pressure} hPa
╰─────
🛰️ *Source:* OpenWeatherMap
👑 *Powered by:* 𝙽𝙾𝚅𝙰-𝚇𝙼𝙳
        `.trim();

        await conn.sendMessage(from, {
            text: report,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363382023564830@newsletter",
                    newsletterName: "𝘕𝘖𝘝𝘈 𝘟𝘔𝘋",
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error(e);
        if (e.response?.status === 404) {
            return reply("🚫 *City not found.* Please check the spelling and try again.");
        }
        return reply("⚠️ *Failed to fetch weather information.* Please try again later.");
    }
});
