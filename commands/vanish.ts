import { ok } from "assert";
import { Bot, cmdData } from "../types";

export const command = {
  name: "vanish",
  active: true,
  cooldown: 5000,
  author_permission: false,
  aliases: ["vanishme"],
  description: 'Times out user for 1 second. Only works if FeelsOkayegBot is a channel moderator',
  run: async (context: cmdData, okayeg: Bot) => {
    let result: string;
    if (context.channelMeta.mode === "Moderator") {
      if (context.user.badges.hasModerator) {
        result = "Cannot time moderators out LULW";
      } else if (context.user.badges.hasBroadcaster) {
        result = "LULW";
      } else {
        result = `/timeout ${context.user.name} 1 vanished`;
      }
    } else {
      result = "Not even a mod LULW";
    }
    await okayeg.CommandUtils.sendCommand(context.channel, result);
  },
};
