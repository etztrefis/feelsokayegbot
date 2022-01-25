import { Bot, cmdData } from "../types";
import { promisify } from "util";
import * as child from "child_process";
import * as fs from "fs";

export const command = {
  name: "ping",
  active: true,
  cooldown: 5000,
  author_permission: false,
  description: "Pong!",
  aliases: ["pong", "peng", "pang"],
  run: async (context: cmdData, okayeg: Bot) => {
    const exec = promisify(child.exec);
    const readFile = fs.promises.readFile;
    const channelsCount = await okayeg.Channel.getJoinable();
    try {
      const [temperature, memory] = await Promise.all([
        exec("sensors"),
        readFile("/proc/meminfo"),
      ]);
      await okayeg.CommandUtils.send(
        context.channel,
        `@${context.user.name}, Pong! Okayeg 👍 Channels: ${
          channelsCount.length
        }, Commands executed: ${
          okayeg.Temp.cmdCount
        }, Uptime: ${okayeg.Utils.misc.uptime()},
                  Temperature: ${temperature.stdout
                    .match(/[+]..../)[0]
                    .replace("+", "")}°C.`,
        context
      );
    } catch (e) {
      await okayeg.CommandUtils.send(
        context.channel,
        `@${context.user.name}, Pong! Okayeg 👍 Channels: ${
          channelsCount.length
        }, Commands executed: ${
          okayeg.Temp.cmdCount
        }, Uptime: ${okayeg.Utils.misc.uptime()}`,
        context
      );
    }
  },
};
