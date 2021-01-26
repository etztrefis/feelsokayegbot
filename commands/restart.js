module.exports.help = {
    name: 'restart',
    cooldown: 0,
    cooldown_mode: 'UserCommand',
    aliases: [],
    permission: true,
    description: 'Resync bot with commands in database.',
    run: async () => {
        const {promisify} = require('util');
        const shell = promisify(require('child_process').exec);

        const ghpull = await shell('git pull origin main');
        fob.Logger.info(`${chalk.green('[Github pull]')} || ${ghpull.stdout}, ${ghpull.stderr}.`);

        const npmi = await shell('npm i');
        fob.Logger.info(`${chalk.green('[Npm install]')} || ${npmi.stdout}, ${npmi.stderr}.`);

        setTimeout(async () => {
            await shell('pm2 restart main');
        }, 3000);

        return 'Done Okayeg';
    },
};
