module.exports.help = {
    name: 'repository',
    archived: false,
    cooldown: 5000,
    cooldown_mode: 'UserCommand',
    aliases: ['repo', 'repository'],
    description: 'Posts bot`s source code repository on github.',
    run: async () => {
        return 'https://github.com/etztrefis/feelsokayegbot';
    },
};
