module.exports.help = {
    name: 'ping',
    archived: false,
    cooldown: 5000,
    cooldown_mode: 'UserCommand',
    aliases: ['pang', 'peng', 'pong', 'pung', 'pyng', 'ping'],
    description: 'Ping!',
    run: async () => {
        const channelsCount = await fob.Channel.getJoinable();
        return `Pong! Okayeg \\u{1F44D} Channels: ${channelsCount.length}, Commands executed: ${fob.Temp.cmdCount}, Uptime: ${fob.Utils.misc.uptime()}.`;
    },
};
