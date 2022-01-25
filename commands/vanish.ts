import { ok } from "assert";
import { Bot, cmdData } from "../types";

export const command = {
  name: "vanish",
  active: true,
  cooldown: 5000,
  author_permission: false,
  aliases: ["vanishme"],
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
