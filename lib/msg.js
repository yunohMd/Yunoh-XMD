const { proto, downloadContentFromMessage, getContentType } = require('@whiskeysockets/baileys');
const fs = require('fs');
const axios = require('axios');
const store = require('../data/store');

const downloadMediaMessage = async (m, filename) => {
    if (m.type === 'viewOnceMessage') m.type = m.msg.type;
    let stream, buffer = Buffer.from([]), name;
    switch (m.type) {
        case 'imageMessage':
            name = filename ? filename + '.jpg' : 'undefined.jpg';
            stream = await downloadContentFromMessage(m.msg, 'image');
            break;
        case 'videoMessage':
            name = filename ? filename + '.mp4' : 'undefined.mp4';
            stream = await downloadContentFromMessage(m.msg, 'video');
            break;
        case 'audioMessage':
            name = filename ? filename + '.mp3' : 'undefined.mp3';
            stream = await downloadContentFromMessage(m.msg, 'audio');
            break;
        case 'stickerMessage':
            name = filename ? filename + '.webp' : 'undefined.webp';
            stream = await downloadContentFromMessage(m.msg, 'sticker');
            break;
        case 'documentMessage':
            const ext = m.msg.fileName.split('.').pop().toLowerCase().replace('jpeg', 'jpg').replace('png', 'jpg').replace('m4a', 'mp3');
            name = filename ? filename + '.' + ext : 'undefined.' + ext;
            stream = await downloadContentFromMessage(m.msg, 'document');
            break;
        default: return;
    }
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
    fs.writeFileSync(name, buffer);
    return fs.readFileSync(name);
};

const sms = (conn, m, storeRef) => {
    if (!m) return m;
    let M = proto.WebMessageInfo;
    if (m.key) {
        m.id = m.key.id;
        m.isBot = m.id.startsWith('BAES') && m.id.length === 16;
        m.isBaileys = m.id.startsWith('BAE5') && m.id.length === 16;
        m.chat = m.key.remoteJid;
        m.fromMe = m.key.fromMe;
        m.isGroup = m.chat.endsWith('@g.us');
        m.sender = m.fromMe ? conn.user.id.split(':')[0] + '@s.whatsapp.net' : m.isGroup ? m.key.participant : m.key.remoteJid;
    }
    if (m.message) {
        m.mtype = getContentType(m.message);
        m.msg = (m.mtype == 'viewOnceMessage' ? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)] : m.message[m.mtype]);
        try {
            m.body = m.message.conversation || m.msg.caption || m.msg.text || '';
        } catch {
            m.body = false;
        }

        let quoted = (m.quoted = m.msg.contextInfo ? m.msg.contextInfo.quotedMessage : null);
        m.mentionedJid = m.msg.contextInfo ? m.msg.contextInfo.mentionedJid : [];

        if (m.quoted) {
            let type = getContentType(quoted);
            m.quoted = m.quoted[type];
            if (['productMessage'].includes(type)) {
                type = getContentType(m.quoted);
                m.quoted = m.quoted[type];
            }
            if (typeof m.quoted === 'string') m.quoted = { text: m.quoted };
            if (!quoted.viewOnceMessageV2) {
                m.quoted.mtype = type;
                m.quoted.id = m.msg.contextInfo.stanzaId;
                m.quoted.chat = m.msg.contextInfo.remoteJid || m.chat;
                m.quoted.isBot = m.quoted.id?.startsWith('BAES');
                m.quoted.isBaileys = m.quoted.id?.startsWith('BAE5');
                m.quoted.sender = conn.decodeJid(m.msg.contextInfo.participant);
                m.quoted.fromMe = m.quoted.sender === (conn.user?.id);
                m.quoted.text = m.quoted.text || m.quoted.caption || '';
                m.quoted.mentionedJid = m.msg.contextInfo?.mentionedJid || [];
                m.getQuotedObj = async () => {
                    if (!m.quoted.id) return false;
                    let q = await storeRef.loadMessage(m.chat, m.quoted.id, conn);
                    return exports.sms(conn, q, storeRef);
                };
                const vM = m.quoted.fakeObj = M.fromObject({
                    key: { remoteJid: m.quoted.chat, fromMe: m.quoted.fromMe, id: m.quoted.id },
                    message: quoted,
                    ...(m.isGroup ? { participant: m.quoted.sender } : {})
                });
                m.quoted.delete = async () => await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: m.quoted.id, participant: m.quoted.sender } });
                m.forwardMessage = (jid, forceForward = true, options = {}) => conn.copyNForward(jid, vM, forceForward, { contextInfo: { isForwarded: false } }, options);
                m.quoted.download = () => conn.downloadMediaMessage(m.quoted);
            }
        }
    }

    m.download = () => conn.downloadMediaMessage(m.msg);
    m.text = m.msg.text || m.msg.caption || m.message?.conversation || '';
    m.copy = () => exports.sms(conn, M.fromObject(M.toObject(m)));
    m.copyNForward = (jid = m.chat, forceForward = false, options = {}) => conn.copyNForward(jid, m, forceForward, options);

    m.reply = async (content, opt = {}, type = 'text') => {
        if (type === 'text') return conn.sendMessage(m.chat, { text: content }, { quoted: m });
        if (type === 'image' && Buffer.isBuffer(content)) return conn.sendMessage(m.chat, { image: content, ...opt }, { quoted: m });
        if (type === 'video' && Buffer.isBuffer(content)) return conn.sendMessage(m.chat, { video: content, ...opt }, { quoted: m });
        if (type === 'audio' && Buffer.isBuffer(content)) return conn.sendMessage(m.chat, { audio: content, ...opt }, { quoted: m });
    };

    return m;
};

// 🔁 Auto ChatGPT Reply Function
async function handleChatBot(message, conn) {
    const chatId = message.chat;
    const isEnabled = store.chatbot?.[chatId];

    if (!isEnabled || message.fromMe || !message.body || message.body.startsWith('.')) return;

    try {
        const prompt = message.body;
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are a helpful WhatsApp assistant.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer YOUR_OPENAI_API_KEY`, // Replace with your actual key
                'Content-Type': 'application/json'
            }
        });

        const reply = response.data.choices[0].message.content.trim();
        await message.reply(reply);
    } catch (err) {
        console.error('ChatGPT error:', err.message);
        await message.reply('❌ ChatGPT error. Check your API key or try again.');
    }
}

// ✅ Export with chatbot support
module.exports = {
    sms,
    downloadMediaMessage,
    replyBot: async (conn, message, storeRef) => {
        const m = await sms(conn, message, storeRef);
        await handleChatBot(m, conn);
        return m;
    }
};
