module.exports.help = {
    name: 'version',
    cooldown: 5000,
    cooldown_mode: 'UserCommand',
    aliases: ['v'],
    description: 'Posts current verion and last commit from bot`s repository on github.',
    run: async (context) => {
        const pjson = require('../package.json');
        const githubResponse = await fob.Utils.got.gh('repos/etztrefis/feelsokayegbot/commits/main');
        return `@${context.user.name}, Current version: ${pjson.version}, Last commit: ${githubResponse.body.html_url}`;
    },
};
