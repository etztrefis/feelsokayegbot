import * as pc from "picocolors";
import * as utils from "util";
import * as fs from "fs";

import { Bot, botCommand } from "./types";
import { client, config, connect } from "./clients";
import { info, debug, warn, error } from "./utils/winston";
import { getInfo } from "./loops";
import { prisma } from "./utils/database";
import {
  getById,
  getByName,
  getJoinable,
  getListenable,
} from "./modules/channel";
import * as misc from "./utils/misc";
import * as commandUtils from "./modules/command";
import { redis, redisGet, redisSet, setpx } from "./utils/redis";
import { cooldownOptions } from "./modules/cooldowns";
import { check } from "./modules/token";
import * as apis from "./utils/apiClients";

const okayeg: Bot = {};

// Dynamic command import
const loadCommands = async () => {
  if (okayeg.Temp.commandsDir) {
    fs.readdir(okayeg.Temp.commandsDir, (error, files) => {
      okayeg.Logger.info(`${pc.green("[COMMANDS]")} || Initializing commands`);
      okayeg.Commands = [];
      files.forEach((file) => {
        import(`${okayeg.Temp.commandsDir}/${file}`).then(
          (module: botCommand) => {
            okayeg.Commands.push(module);
            okayeg.Logger.info(
              `${pc.green("[COMMANDS]")} || Loaded ${module.command.name}`
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
  info,
  warn,
  error,
  debug,
};
okayeg.Utils = {
  db: prisma,
  misc: {
    ...misc,
  },
  cache: {
    redis: redis,
    get: redisGet,
    set: redisSet,
    setpx,
  },
  loadCommands,
  got: { ...apis },
};
okayeg.Loops = { initialize: getInfo };
okayeg.Channel = {
  getById,
  getByName,
  getJoinable,
  getListenable,
};
okayeg.Token = {
  check: check,
};
okayeg.CommandUtils = {
  ...commandUtils,
};
okayeg.Cooldown = cooldownOptions;
okayeg.Temp = { cmdCount: 1, commandsDir: "./commands", pubsubTopics: [] };

// Load Clients
okayeg.Twitch = client;
okayeg.PubSub = {
  connect,
};

// Initialize Data and Connect Clients
async function initialize() {
  try {
    await okayeg.Utils.loadCommands();
    await okayeg.Token.check();
    await okayeg.Loops.initialize();
    await okayeg.Twitch.initialize();
    await okayeg.PubSub.connect();
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
      `${pc.red("[UnhandledRejection]")} || ${reason}`
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
