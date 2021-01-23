module.exports.help = {
    name: 'vanish',
    cooldown: 5000,
    cooldown_mode: 'UserCommand',
    aliases: ['vanishme'],
    description: 'Times out user for 1 second. Only works if FeelsOkayegBot is a channel moderator',
    run: async (context) => {
        if (context.channelMeta.Mode === 'Moderator') {
            if (context.user.badges.indexOf('moderator') > -1) {
                return 'Cannot time modarators out. LULW';
            } else if (context.user.badges.indexOf('broadcaster') > -1) {
                return 'Cannot time broadcaster out. LULW';
            } else {
                return `/timeout ${context.user.name} 1 vanished`;
            }
        } else {
            return 'Not even a mod. LULW';
        }
    },

};
