import * as pc from "picocolors";
import { levels } from "../modules/cooldowns";
import { Bot, cmdData } from "../types";
import { humanizer } from "../utils/misc";

export const command = {
  name: "game",
  active: true,
  cooldown: 5000,
  cooldown_mode: levels.CHANNEL,
  author_permission: false,
  description:
    "Fetches stream's game, sets it if you are a mod on the trefis's channel.",
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
        .helix(`games?name=${messageArgs}`)
        .then(async (response) => {
          if (response.data.length > 0) {
            const gameId = response.data[0].id;
            await okayeg.Utils.got
              .helix(`channels?broadcaster_id=${context.channelId}`, {
                method: "PATCH",
                data: {
                  game_id: gameId,
                },
              })
              .then(() => {
                result = "Successfully updated.";
              })
              .catch((error) => {
                result = `Error occured while updating the game, gameId is ${gameId}.`;
                okayeg.Logger.warn(
                  `${pc.yellow(
                    "[TITLE]"
                  )} || Error occured while updating the title  ${
                    error.data.error
                  }`
                );
              });
          } else {
            result = "Couldn't found the specified game.";
          }
        });
    } else {
      if (streamData && streamData.game) {
        const delta = okayeg.Utils.misc.timeDelta(
          streamData.gameTime.getTime()
        );
        result = `Game: ${streamData.game} ${
          streamData.gameTime ? `| Last change: ${delta} ago` : ""
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
