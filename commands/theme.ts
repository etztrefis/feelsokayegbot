import { Bot, cmdData } from "../types";

export const command = {
  name: "theme",
  active: true,
  cooldown: 5000,
  author_permission: false,
  description:
    "Posts information about trefis's VS Code theme.",
  aliases: [],
  run: async (context: cmdData, okayeg: Bot) => {
    const result = `Theme: "Bearded Theme", Variant: "Black & Amethyst"`
    await okayeg.CommandUtils.send(context.channel, result, context);
  },
};
