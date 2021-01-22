module.exports.initialize = () => {
    return new Promise((resolve, reject) => {
        fob.Temp.cmdFiles.clear();
        fob.Temp.cmdAliases.clear();
        fob.Utils.recurseDir(`${require.main.path}/commands`, /\.js$/).forEach(
            (f) => {
                try {
                    delete require.cache[`${f}`];
                    const cmd = require(`${f}`);
                    if (cmd.help.archived) return;
                    fob.Temp.cmdFiles.set(cmd.help.name, cmd);
                    if (cmd.help.aliases) {
                        cmd.help.aliases.forEach((alias) => {
                            fob.Temp.cmdAliases.set(alias, cmd.help.name);
                        });
                    }
                } catch (e) {
                    e.filename = f;
                    fob.Logger.error(
                        `Failed to load command file ${f}, Error: ${e}`,
                    );
                    return reject(e);
                }
            },
        );
        fob.Logger.info(`Loaded ${fob.Temp.cmdFiles.size} commands!`);
        return resolve(true);
    });
};

module.exports.sync = async function commandSync() {
    await fob.Utils.db.query('DELETE FROM Commands');
    await fob.Utils.db.query('ALTER TABLE feelsokayegbot.Commands AUTO_INCREMENT=1');

    const chalk = require('chalk');
    const cmdFiles = Array.from(fob.Temp.cmdFiles.values()).filter(
        (cmd) => !cmd.help.archived,
    );
    for (const cmd of cmdFiles) {
        await fob.Logger.info(`Loads ${cmd.help.name} command in database. 🔧 `);
        if (cmd.help.aliases) {
            await fob.Utils.db
                .query(
                    `INSERT INTO Commands (Name, Aliases, Description, Code, Cooldown, Cooldown_Mode, Author_Permission, Active) VALUES 
                    ("${cmd.help.name}", '${JSON.stringify(cmd.help.aliases)}', "${cmd.help.description}", "${String(cmd.help.run)}", "${cmd.help.cooldown}", "${cmd.help.cooldown_mode}", ${cmd.help.permission ?? 0}, ${cmd.help.active ?? 1})`)
                .catch((e) => {
                    fob.Logger.warn(
                        `${chalk.red('[Sequelize Error]')} || ${
                            e.name
                        } -> ${e.message} ||| ${e.stack}`,
                    );
                });
        } else {
            await fob.Utils.db
                .query(
                    `INSERT INTO Commands (Name, Description, Code) VALUES ("${
                        cmd.help.name
                    }", "${cmd.help.description}", "${String(
                        cmd.help.run,
                    )}")`,
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

    module.exports.get = async (cmdString) => {
        cmdString = cmdString.replace(/[/]/|/`/|/"/|/'/|/\n|\r/g, '');
        let command = await fob.Utils.db
            .query(`SELECT * FROM Commands WHERE Name = "${cmdString}"`)
            .catch((e) => {
                fob.Logger.warn(
                    `${chalk.red('[Sequelize Error]')} || ${e.name} -> ${
                        e.message
                    } ||| ${e.stack}`,
                );
            });
        if (command[0][0] === undefined) {
            command = await fob.Utils.db
                .query(`SELECT * FROM Commands WHERE Aliases LIKE "%${cmdString}%"`)
                .catch((e) => {
                    fob.Logger.warn(
                        `${chalk.red('[Sequelize Error]')} || ${e.name} -> ${
                            e.message
                        } ||| ${e.stack}`,
                    );
                });
            if (command[0][0] === undefined) {
                return null;
            }
        }

        if (command[0][0].Aliases) {
            try {
                command[0][0].Aliases = eval(command[0][0].Aliases);
            } catch (e) {
                fob.Logger.error(
                    `Command ${command[0][0].Name} has an invalid alias definition.`,
                );
                command[0][0].Aliases = [];
            }
        }
        return command[0][0];
    };

    module.exports.execute = async (cmdString, cmdMeta) => {
        const commandData = await fob.Command.get(cmdString);

        if (!commandData) {
            return {state: false, cmd: cmdString, data: 'cmd-not-found'};
        }
        await fob.Modules.cooldown(cmdMeta, {
            Level: commandData.Cooldown_Mode || 'UserCommand',
        });

        const cmdEvalResp = await eval(commandData.Code)(cmdMeta);

        return {state: true, cmd: cmdString, data: cmdEvalResp};
    };
};
