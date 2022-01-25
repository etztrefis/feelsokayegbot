import { Bot, cmdData } from "../types";
import { levels } from "../modules/cooldowns";
import { commandPermissions } from "../clients";

export const command = {
  name: "commands",
  active: true,
  cooldown: 5000,
  cooldown_mode: levels.CHANNEL,
  author_permission: false,
  description:
    "Posts list of available commands use author/mod/broadcaster as a first argument to see commands for specified user type if you have the permission for that.",
  aliases: [],
  run: async (context: cmdData, okayeg: Bot) => {
    const arg = context.message.args[0].toLocaleLowerCase();
    const isAuthor = context.user.name === okayeg.Config.owner;
    const isMod = context.user.badges.hasModerator;
    const isBroad = context.user.badges.hasBroadcaster;

    let result: string;
    if (arg === "author" && isAuthor) {
      result = `Author's commands: [${okayeg.Commands.sort()
        .filter((item) => item.command.author_permission)
        .map((item) => item.command.name)
        .join(", ")}]`;
    } else if (arg === "mod" && (isMod || isBroad || isAuthor)) {
      result = `Mod's commands: [${okayeg.Commands.sort()
        .filter(
          (item) =>
            item.command.permission &&
            item.command.permission === commandPermissions.MOD
        )
        .map((item) => item.command.name)
        .join(", ")}]`;
    } else if (arg === "broadcaster" && (isBroad || isAuthor)) {
      result = `Broadcaster's commands: [${okayeg.Commands.sort()
        .filter(
          (item) =>
            item.command.permission &&
            item.command.permission === commandPermissions.BROADCASTER
        )
        .map((item) => item.command.name)
        .join(", ")}]`;
    } else {
      result = `List of commands: [${okayeg.Commands.sort()
        .filter(
          (item) => !item.command.author_permission && !item.command.permission
        )
        .map((item) => item.command.name)
        .join(", ")}]`;
    }

    await okayeg.CommandUtils.send(context.channel, result, context);
  },
};
