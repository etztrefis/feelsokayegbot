module.exports.help = {
    name: 'repository',
    cooldown: 5000,
    cooldown_mode: 'UserCommand',
    aliases: ['repo', 'repository'],
    description: 'Posts bot`s source code repository on github.',
    run: async (context) => {
        return `@${context.user.name}, https://github.com/etztrefis/feelsokayegbot`;
    },
};
