import * as pc from "picocolors";
import { levels } from "../modules/cooldowns";
import { Bot, cmdData } from "../types";
import { humanizer } from "../utils/misc";

export const command = {
  name: "title",
  active: true,
  cooldown: 5000,
  cooldown_mode: levels.CHANNEL,
  author_permission: false,
  description:
    "Fetches stream's title, sets it if you are a mod on the trefis's channel.",
  aliases: [],
  run: async (context: cmdData, okayeg: Bot) => {
    const messageArgs = context.message?.args.join(" ");
    const isMod = context.user.badges.hasModerator;
    const isBroad = context.user.badges.hasBroadcaster;

    const streamData = await okayeg.Channel.getByName(context.channel);
    let result: string;
    if (
      messageArgs &&
      (isMod || isBroad) &&
      context.channel === okayeg.Config.owner
    ) {
      await okayeg.Utils.got
        .helix(`channels?broadcaster_id=${context.channelId}`, {
          method: "PATCH",
          data: {
            title: messageArgs,
          },
        })
        .then(() => {
          result = "Successfully updated.";
        })
        .catch((error) => {
          result = `Error occured while updating the title.`;
          okayeg.Logger.warn(
            `${pc.yellow(
              "[TITLE]"
            )} || Error occured while updating the title  ${error.data.error}`
          );
        });
    } else {
      if (streamData && streamData.title) {
        const delta = okayeg.Utils.misc.timeDelta(
          streamData.titleTime.getTime()
        );
        result = `Title: ${streamData.title} ${
          streamData.titleTime ? `| Last change: ${delta} ago` : ""
        }`;
      } else {
        result = "Couldn't get information about the channel Sadeg";
      }
    }
    await okayeg.CommandUtils.send(
      context.channel,
      `${context.user.name}, ${result}`,
      context
    );
  },
};
