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
