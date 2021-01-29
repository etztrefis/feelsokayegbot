module.exports.help = {
    name: 'ping',
    cooldown: 5000,
    cooldown_mode: 'UserCommand',
    aliases: ['pang', 'peng', 'pong', 'pung', 'pyng', 'ping'],
    description: 'Ping!',
    run: async (context) => {
        const {promisify} = require('util');
        const exec = promisify(require('child_process').exec);
        const readFile = require('fs').promises.readFile;
        const [temperature, memory] = await Promise.all([
            exec('sensors'),
            readFile('/proc/meminfo'),
        ]);
        const channelsCount = await fob.Channel.getJoinable();
        return `@${context.user.name}, Pong! Okayeg \\u{1F44D} Channels: ${channelsCount.length}, Commands executed: ${fob.Temp.cmdCount}, Uptime: ${fob.Utils.misc.uptime()},
            Temperature: ${temperature.stdout.match(/[+]..../)[0].replace('+', '')}°C.`;
    },
};
