module.exports.get = async (data = {}) => {
    if (!data.id) {
        throw new Error('No ID provided.');
    }

    const user = await fob.Utils.db
        .query(`SELECT * FROM User WHERE Twitch_ID = "${data.id}"`)
        .catch((e) => {
            fob.Logger.warn(
                `${chalk.red('[Sequelize Error]')} || ${e.name} -> ${
                    e.message
                } ||| ${e.stack}`,
            );
        });

    if (user[0][0] === undefined) {
        return await fob.Modules.user.create(data);
    } else {
        return user[0][0];
    }
};

module.exports.create = async (data = {}) => {
    if (!data.id || !data.name) {
        throw new Error('[User-Create] -> Missing parameters.');
    }
    await fob.Utils.db
        .query(
            `INSERT INTO User (Username, Twitch_ID) VALUES ("${data.name}", "${data.id}")`,
        )
        .then(() => {
            fob.Logger.debug(
                `[User-Create] -> User ${data.name}/${data.id} created with`,
            );
            return true;
        })
        .catch((e) => {
            fob.Logger.warn(
                `${chalk.red('[Sequelize Error]')} || ${e.name} -> ${
                    e.message
                } ||| ${e.stack}`,
            );
            return false;
        });
};
