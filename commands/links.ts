import { Bot, cmdData } from "../types";

export const command = {
  name: "links",
  active: true,
  cooldown: 5000,
  author_permission: false,
  aliases: ["link", "l"],
  run: async (context: cmdData, okayeg: Bot) => {
    const arg = context.message.args[0];
    let result: string;

    if (arg === "creator") {
      result = `https://dashboard.twitch.tv/u/${context.channel}/stream-manager`;
    } else if (arg === "mod") {
      result = `https://www.twitch.tv/moderator/${context.channel}`;
    } else {
      result = "Available only mod and creator arguments Sadeg";
    }

    await okayeg.CommandUtils.send(context.channel, result, context);
  },
};
