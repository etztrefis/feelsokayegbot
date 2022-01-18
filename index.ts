import * as pc from "picocolors";
import * as utils from "util";
import * as fs from "fs";

import { Bot, botCommand } from "./types";
import { client, config } from "./clients";
import { info, debug, warn, error } from "./utils/winston";
import { prisma } from "./utils/database";
import { get, getJoinable } from "./modules/channel";
import { uptime, logError, updateBannedState } from "./utils/misc";
import { send, sendError } from "./modules/command";

const okayeg: Bot = {};

// Dynamic command import
const loadCommands = () => {
  if (okayeg.Temp.commandsDir) {
    fs.readdir(okayeg.Temp.commandsDir, (error, files) => {
      okayeg.Logger.info(`${pc.green("[COMMANDS]")} || Initializing commands`);
      files.forEach((file) => {
        import(`${okayeg.Temp.commandsDir}/${file}`).then(
          (module: botCommand) => {
            okayeg.Commands = [];
            okayeg.Commands.push(module);
            okayeg.Logger.info(
              `${pc.green("[COMMANDS]")} || Loading ${module.command.name}`
            );
          }
        );
      });
      if (error) {
        okayeg.Logger.warn(
          `${pc.green(
            "[COMMANDS]"
          )} || Error occured while initializing commands | ${error.message}`
        );
      }
    });
  }
};

// Load Modules
okayeg.Config = config;
okayeg.Logger = {
  info: info,
  warn: warn,
  error: error,
  debug: debug,
};
okayeg.Utils = {
  db: prisma,
  misc: {
    uptime: uptime,
    logError: logError,
    updateBannedState: updateBannedState,
  },
  loadCommands: loadCommands,
};
okayeg.Channel = {
  get: get,
  getJoinable: getJoinable,
};
okayeg.CommandUtils = {
  send: send,
  sendError: sendError,
};

okayeg.Temp = { cmdCount: 1, commandsDir: "./commands" };

// Load Clients
okayeg.Twitch = client;

// Initialize Data and Connect Clients
async function initialize() {
  try {
    //TODO: token check, load all shit
    okayeg.Utils.loadCommands();
    await okayeg.Twitch.initialize();
  } catch (error) {
    okayeg.Logger.error(`Error encountered during initialization: ${error}`);
  }
}

initialize();

// Exception Handlers
process
  .on("unhandledRejection", async (reason, promise) => {
    await okayeg.Utils.misc.logError(
      "UnhandledRejection",
      utils.inspect(promise),
      utils.inspect(reason)
    );
    return okayeg.Logger.error(
      `${pc.red("[UnhandledRejection]")} || ${utils.inspect(
        promise
      )} -> ${reason}`
    );
  })
  .on("uncaughtException", async (error) => {
    await okayeg.Utils.misc.logError(
      "UnhandledRejection",
      error.message,
      error.stack || ""
    );
    okayeg.Logger.error(`${pc.red("[UncaughtException]")} || ${error.message}`);
    return process.exit(0);
  });

export { okayeg };
