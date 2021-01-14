module.exports = async (
    {command, channel, channelid, platform, user: {id, login}},
    options = {},
) => {
    if (!options.Level) options.Level = 'UserCommand';
    if (!options.Mode) options.Mode = 'add';

    const channelData = fob.Channel.get(channel) ?? {};
    const {
        Name: cmdName,
        Cooldown: cmdCooldown,
        User_Cooldown: cmdUserCooldown,
    } = await fob.Command.get(command);

    const userMeta = await fob.Modules.user.get({
        id: id,
        name: login,
    });

    const prefix = `cooldown-${platform}-${channelid}`;

    if (options.Mode === 'add') {
        if (userMeta?.Extra?.BypassCooldowns) {
            return false;
        }

        if (options.Level === 'Disabled') {
            return false;
        }

        if (channelData.Extra?.DisableCooldowns?.includes(cmdName)) {
            return false;
        }

        if (options.Level === 'User') {
            await fob.Utils.cache.setpx(
                `${prefix}-${id}`,
                true,
                cmdUserCooldown || fob.Config.usercd,
            );
        }

        if (options.Level === 'Channel') {
            await fob.Utils.cache.setpx(
                `${prefix}-${cmdName}`,
                true,
                cmdCooldown || channelData.Cooldown || fob.Config.parms.defaultcd,
            );
        }

        if (options.Level === 'UserCommand') {
            await fob.Utils.cache.setpx(
                `${prefix}-${id}-${cmdName}`,
                true,
                cmdCooldown || fob.Config.usercd,
            );
        }

        if (options.Level === 'UserCommandChannel') {
            await fob.Utils.cache.setpx(
                `${prefix}-${id}-${cmdName}`,
                true,
                cmdUserCooldown || channelData.UserCooldown || cc.Config.usercd,
            );
            await fob.Utils.cache.setpx(
                `${prefix}-${cmdName}`,
                true,
                cmdCooldown || channelData.Cooldown || fob.Config.parms.defaultcd,
            );
        }
    }

    if (options.Mode === 'check') {
        if (userMeta?.Extra?.BypassCooldowns) {
            return false;
        }

        if (await fob.Utils.cache.get(`${prefix}-${cmdName}`)) {
            return true;
        }
        if (await fob.Utils.cache.get(`${prefix}-${id}-${cmdName}`)) {
            return true;
        }

        return false;
    }
};
