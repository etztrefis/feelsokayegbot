import { Bot, cmdData } from "../types";

export const command = {
  name: "links",
  active: true,
  cooldown: 5000,
  author_permission: false,
  description:
    "Posts administration link in chat! Use command with mod or creator as first argument to post a link with view of this channel.",
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

    await okayeg.CommandUtils.send(
      context.channel,
      `${context.user.name}, ${result}`,
      context
    );
  },
};
