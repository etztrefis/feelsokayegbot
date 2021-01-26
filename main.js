const chalk = require('chalk');
const utils = require('util');

global.fob = {};
fob.Temp = {};

// Load Modules
fob.Config = require('./config');
fob.Utils = require('./util');
fob.Logger = require('./util/winston');
fob.Modules = require('./modules');
fob.Command = require('./modules/command');
fob.Channel = require('./modules/channel');

// Load Clients
fob.Twitch = require('./client/twitch');
// fob.TwitchPubsub = require('./client/twitch-pubsub');

fob.Temp.cmdCount = 1;
fob.Temp.cmdFiles = new Map();
fob.Temp.cmdAliases = new Map();

// Initialize Data and Connect Clients
async function start() {
    try {
        await fob.Modules.config.loadAll();
        await fob.Modules.token.check();
        await fob.Twitch.initialize();
        // await fob.TwitchPubsub.connect();
    } catch (e) {
        fob.Logger.error(`Error encountered during initialization: ${e}`);
        console.error(e);
    }
}

start();

// Exception Handlers
process
    .on('unhandledRejection', async (reason, promise) => {
        await fob.Utils.misc.logError(
            'PromiseRejection',
            utils.inspect(promise),
            utils.inspect(reason),
        );
        return fob.Logger.error(
            `${chalk.red('[UnhandledRejection]')} || ${utils.inspect(
                promise,
            )} -> ${reason}`,
        );
    })
    .on('uncaughtException', async (err) => {
        await fob.Utils.misc.logError(
            'UncaughtException',
            err.message,
            err.stack,
        );
        fob.Logger.error(
            `${chalk.red('[UncaughtException]')} || ${err.message}`,
        );
        return process.exit(0);
    });

// Update Supinic bot status every 10 minutes
// setInterval(async () => {
//     try {
//         await fob.Utils.misc.supiactive();
//     } catch (e) {
//         fob.Logger.warn(`Error while refreshing bot active status: ${e}`);
//     }
// }, 600000);
