const Twitch = require('dank-twitch-irc');
const chalk = require('chalk');

const client = new Twitch.ChatClient({
    username: fob.Config.username,
    rateLimits: 'default',
});

client.use(new Twitch.AlternateMessageModifier(client));
client.use(new Twitch.SlowModeRateLimiter(client, 10));

client.initialize = async () => {
    client.configuration.password = fob.Config.password;
    const channels = await fob.Channel.getJoinable();
    await client.joinAll(channels);
    client.connect();
};

client.on('ready', async () => {
    fob.Logger.info(`${chalk.green('[CONNECTED]')} || Connected to Twitch. 😳 `);
    await client.say(fob.Config.owner, '😳');
    await client.say('rilaveon', 'blobWob');
});

client.on('error', (error) => {
    if (error instanceof Twitch.LoginError) {
        fob.Logger.warn(
            `${chalk.red('[LOGIN]')} || Error logging in to Twitch: ${error}`,
        );
        client.configuration.password = fob.Config.password;
    }
    if (error instanceof Twitch.JoinError) {
        return fob.Logger.warn(
            `${chalk.red('[JOIN]')} || Error joining channel ${
                error.failedChannelName
            }: ${error}`,
        );
    }
    if (error instanceof Twitch.SayError) {
        return fob.Logger.warn(
            `${chalk.red('[SAY]')} || Error sending message in ${
                error.failedChannelName
            }: ${error.cause} | ${error}`,
        );
    }
    fob.Logger.error(
        `${chalk.red('[ERROR]')} || Error occurred in DTI: ${error}`,
    );
});

client.on('CLEARCHAT', (msg) => {
    if (msg.isTimeout()) {
        fob.Logger.warn(
            `${chalk.green('[Timeout]')} || Got timed out in ${
                msg.channelName
            } for ${msg.banDuration} seconds`,
        );
        fob.Utils.cache.set(
            `channelTimeout-${msg.channelName}`,
            true,
            msg.banDuration + 2,
        );
    }

    if (msg.wasChatCleared()) {
        fob.Logger.info(
            `${chalk.green('[CLEARCHAT]')} || Chat was cleared in ${
                msg.channelName
            }`,
        );
    }
});

client.on('NOTICE', async ({channelName, messageID, messageText}) => {
    if (!messageID) {
        return;
    }
    switch (messageID) {
    case 'msg_rejected':
    case 'msg_rejected_mandatory': {
        fob.Logger.debug(
            `Received msg_rejected/mandatory from ${channelName}! -> ${messageText}`,
        );
        break;
    }

    case 'no_permission': {
        fob.Logger.debug(
            `Received no_permission from ${channelName}! -> ${messageText}`,
        );
        break;
    }

    case 'host_on':
    case 'host_target_went_offline': {
        break;
    }

    default: {
        const channelMeta = fob.Channel.get(channelName);
        await fob.Utils.misc.log(
            'Notice',
            'Twitch',
            channelMeta.ID,
            null,
            messageID,
            messageText,
            null,
        );
        fob.Logger.info(
            `${chalk.green(
                '[NOTICE]',
            )} || Incoming notice: ${messageID} in channel ${channelName} -> ${messageText}`,
        );
    }
    }
});

client.on('PRIVMSG', (msg) => handleMsg(msg));

client.on('WHISPER', (msg) => handleMsg(msg));

const handleMsg = async (msg) => {
    const type = msg instanceof Twitch.WhisperMessage ? 'whisper' : 'privmsg';
    const channelMeta = await fob.Channel.get(msg.channelName);
    const message = msg.messageText;
    const content = message.split(/\s+/g);
    const command = content[0];
    const commandstring = command.slice(fob.Config.prefix.length);
    const args = content.slice(1);
    const cmdData = {
        user: {
            id: msg.senderUserID,
            name: msg.displayName,
            login: msg.senderUsername,
            color: msg.colorRaw,
            badges: msg.badgesRaw,
        },
        message: {
            raw: msg.rawSource,
            text: message,
            args: args,
        },
        type: type,
        platform: 'Twitch',
        command: commandstring,
        channel: msg.channelName,
        channelid: msg.channelID,
        channelMeta: channelMeta,
        userstate: msg.ircTags,
    };
    // Update bot status
    if (msg.senderUsername === fob.Config.username && channelMeta) {
        const currMode = channelMeta.Mode;
        if (msg.badges) {
            if (msg.badges.hasModerator || msg.badges.hasBroadcaster) {
                channelMeta.Mode = 'Moderator';
            } else if (msg.badges.hasVIP) {
                channelMeta.Mode = 'VIP';
            } else {
                channelMeta.Mode = 'User';
            }
            if (currMode !== channelMeta.Mode) {
                await fob.Utils.db
                    .query(
                        `UPDATE Channels SET Mode = "${channelMeta.Mode}" WHERE Name = "${channelMeta.Name}"`,
                    )
                    .catch((e) => {
                        fob.Logger.warn(
                            `${chalk.red('[Sequelize Error]')} || ${
                                e.name
                            } -> ${e.message} ||| ${e.stack}`,
                        );
                    });
            }
        }
    }

    // Ignore messages from self.
    if (msg.senderUsername === fob.Config.username) {
        return;
    }

    // If the bot is timed out, do not process anything
    if (await fob.Utils.cache.get(`channelTimeouts-${msg.channelName}`)) {
        return;
    }

    // Check if channel is ignored
    if (type === 'privmsg' && channelMeta.Ignore === 1) {
        return;
    }
    // Input is a command. Process it as such
    if (msg.messageText.startsWith(fob.Config.prefix)) {
        const cmdMeta = await fob.Command.get(commandstring);
        // No command found. Do nothing.
        if (!cmdMeta) {
            return;
        } else {
            cmdData.cmdMeta = cmdMeta;
        }

        if (cmdData.cmdMeta.Author_Permission === 1 && msg.senderUsername !== 'trefis') {
            return;
        }

        if (cmdData.cmdMeta.active === 0) {
            return;
        }

        // Check if cooldown is active.
        if (await fob.Modules.cooldown(cmdData, {Mode: 'check'})) {
            return;
        }

        try {
            const userMeta = await fob.Modules.user.get({
                id: cmdData.user.id,
                name: cmdData.user.login,
            });

            cmdData.userMeta = userMeta;
            const cmdRun = await fob.Command.execute(
                commandstring,
                cmdData,
            );

            if (cmdRun.state === false) {
                return await send(
                    cmdData,
                    `Command ${cmdRun.cmd} failed: ${cmdRun.data}`,
                );
            }

            fob.Temp.cmdCount++;

            if (!cmdRun.data) {
                return await send(
                    cmdData,
                    'Command returned no data. must be something Pepega',
                );
            }

            return await send(cmdData, cmdRun.data);
        } catch (e) {
            await fob.Utils.misc.logError(e.name, e.message, e.stack);
            if (e instanceof SyntaxError) {
                fob.Logger.warn(
                    `${chalk.red('[SyntaxError]')} || ${e.name} -> ${
                        e.message
                    } ||| ${e.stack}`,
                );
                return await send(cmdData, 'This command has a Syntax Error.');
            }
            if (e instanceof TypeError) {
                fob.Logger.warn(
                    `${chalk.red('[TypeError]')} || ${e.name} -> ${
                        e.message
                    } ||| ${e.stack}`,
                );
                return await send(cmdData, 'This command has a Type Error.');
            }
            await send(
                cmdData,
                'Error occurred while executing the command. FeelsBadMan',
            );
            return fob.Logger.error(
                `Error executing command: (${e.name}) -> ${e.message} ||| ${e.stack}`,
            );
        }
    }
};

const send = async (meta, msg) => {
    if (!msg || !meta) {
        return;
    }
    msg = msg.replace(/\n|\r/g, '');
    try {
        // Trim the message to the twitch message limit or lower if configured
        let lengthLimit = fob.Config.msgLenLimit;
        lengthLimit -= 2;
        let message = msg.substring(0, lengthLimit);
        if (message.length < msg.length) {
            message = msg.substring(0, lengthLimit - 1) + '…';
        }
        await client.privmsg(meta.channel, message);
    } catch (e) {
        if (
            e instanceof Twitch.SayError && e.message.includes('@msg-id=msg_rejected')
        ) {
            return await send(
                meta,
                'That message violates the channel automod settings.',
            );
        }
        if (
            e instanceof Twitch.SayError && e.message.includes('@msg-id=msg_duplicate')
        ) {
            return await send(meta, 'That message was a duplicate monkaS');
        }
        await client.say(
            meta.channel,
            'Error while processing the reply message monkaS',
        );
        fob.Logger.error(`Error while processing reply message: ${e}`);
        await fob.Utils.misc.logError('SendError', e.message, e.stack);
    }
};

module.exports = client;
