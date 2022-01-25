import { Bot, cmdData } from "../types";
import * as pc from "picocolors";
import { levels } from "../modules/cooldowns";

export const command = {
  name: "update",
  active: true,
  cooldown_mode: levels.DISABLED,
  author_permission: true,
  aliases: [],
  run: async (context: cmdData, okayeg: Bot) => {
    okayeg.Logger.info(
      `${pc.green(
        "[UPDATE]"
      )} || Called update command. Resynchronizing commands.`
    );

    await okayeg.Utils.loadCommands().then(async () => {
      await okayeg.CommandUtils.send(
        context.channel,
        "Now bot is up to date Okayeg 👍",
        context
      );
    });
  },
};
