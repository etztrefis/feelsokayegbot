module.exports.loadAll = async () => {
    fob.Data = {};
    fob.Data.channels = await fob.Utils.db.query('SELECT * from Channels');
    fob.Data.banphrase = await fob.Utils.db.query(
        'SELECT * FROM Banphrase WHERE Enabled = 1',
    );
    fob.Data.cmd = await fob.Utils.db.query(
        'SELECT * from Commands WHERE Active = 1',
    );
    await fob.Command.initialize();
    await fob.Command.sync();
    fob.Logger.info('Config Loaded');
};
