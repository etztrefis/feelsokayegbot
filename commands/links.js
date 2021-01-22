module.exports.help = {
    name: 'links',
    cooldown: 5000,
    cooldown_mode: 'UserCommand',
    aliases: ['link', 'l'],
    description: 'Posts administration link in chat! Use command with mod or creator as first agrument to post a link with view of this channel and username as second argument to post a link with provided username.',
    run: async (context) => {
        if (context.message.args[0] === 'creator' && context.message.args[1] === undefined) {
            return `https://dashboard.twitch.tv/u/${context.channel}/stream-manager`;
        } else if (context.message.args[0] === 'mod' && context.message.args[1] === undefined) {
            return `https://www.twitch.tv/moderator/${context.channel}`;
        } else if ((context.message.args[0] === 'creator' && context.message.args[1] !== undefined)) {
            return `https://dashboard.twitch.tv/u/${context.message.args[1]}/stream-manager`;
        } else if (context.message.args[0] === 'mod' && context.message.args[1] !== undefined) {
            return `https://www.twitch.tv/moderator/${context.message.args[1]}`;
        } else if (context.message.args[0] !== 'mod' || context.message.args[0] !== 'creator') {
            return 'Avaliable only mod and creator arguments.';
        } else if (context.message.args[0] === undefined) {
            return 'No arguments were specified Okayeg';
        }
    },
};
