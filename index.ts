import * as pc from "picocolors";
import * as utils from "util";
import * as fs from "fs";

import { Bot, botCommand } from "./types";
import { client, config } from "./clients";
import { info, debug, warn, error } from "./utils/winston";
import { prisma } from "./utils/database";
import { get, getJoinable } from "./modules/channel";
import { uptime, logError, updateBannedState } from "./utils/misc";

const okayeg: Bot = {};

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
};
okayeg.Channel = {
  get: get,
  getJoinable: getJoinable,
};

// Dynamic command import
const dir = "./commands";
fs.readdir(dir, (error, files) => {
  files.forEach((file) => {
    import(`${dir}/${file}`).then((module: botCommand) => {
      console.log(module);
    });
  });
});

okayeg.Temp = { cmdCount: 1 };

// Load Clients
okayeg.Twitch = client;

// Initialize Data and Connect Clients
async function initialize() {
  try {
    //TODO: token check, load all shit
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
