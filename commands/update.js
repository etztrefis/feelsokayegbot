module.exports.help = {
    name: 'update',
    archived: false,
    cooldown: 0,
    cooldown_mode: 'UserCommand',
    aliases: [],
    permission: true,
    description: 'Resync bot with commands in database.',
    run: async () => {
        await fob.Logger.info('Resynchronizing commands... 🤔 🔍 ');
        await fob.Command.initialize();
        await fob.Command.sync();
        return 'Now bot is up to date. Okayeg';
    },
};
