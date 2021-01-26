module.exports.get = async (channel) => {
    const channelData = await fob.Utils.db.query(
        `SELECT * FROM Channels WHERE Name = "${channel}"`,
    );
    if (!channelData) {
        return {};
    }

    return channelData[0][0];
};

module.exports.getJoinable = async () => {
    const channels = [];
    const channelsQuery = await fob.Utils.db.query('SELECT Name FROM Channels');
    for (let i = 0; i < channelsQuery[0].length; i++) {
        channels.push(channelsQuery[0][i].Name);
    }
    if (channels !== []) {
        return channels;
    } else {
        return [];
    }
};

module.exports.join = async (channel) => {
    const userID = await fob.Utils.got.helix(`users?login=${channel}`).json();
    if (userID.data[0] === undefined) {
        return 'User doesn`t exists.';
    }
    const data = await fob.Channel.getJoinable();

    if (data.includes(channel)) {
        return 'Already joined.';
    } else {
        await fob.Utils.db.query(`INSERT INTO Channels (Name, ID) VALUES ("${channel}", "${userID.data[0]['id']}")`).catch((e) => {
            fob.Logger.error(
                `Error sequelize insert: (${e.name}) -> ${e.message} ||| ${e.stack}`,
            );
        });
        return {reply: channel};
    }
};
