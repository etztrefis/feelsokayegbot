import { Bot, cmdData } from "../types";
import * as pc from "picocolors";

export const command = {
  name: "uptime",
  active: true,
  cooldown: 5000,
  author_permission: false,
  description: "Posts stream info about Twitch channel",
  aliases: [],
  run: async (context: cmdData, okayeg: Bot) => {
    let result: string;
    await okayeg.Utils.got
      .helix(`streams?user_id=${context.channelId}`)
      .then(async (streamData) => {
        if (!streamData.data) {
          await okayeg.Utils.got
            .leppunen(`user/${context.channel}`)
            .then((broadcasterData) => {
              const { banned, lastBroadcast, displayName } = broadcasterData;
              const channelStatus = banned ? "banned" : "offline";
              if (!lastBroadcast.startedAt) {
                result = `${displayName} is ${channelStatus} - never streamed before.`;
              }
              const delta = okayeg.Utils.misc.timeDelta(
                new Date(lastBroadcast.startedAt as string).getTime()
              );
              const title = lastBroadcast.title ?? "(no title)";

              result = `${displayName} is ${channelStatus} | Last streamed ${delta} ago, title: ${title}`;
            })
            .catch(() => {
              result = "Channel is offline. No more data could be found.";
            });
        }
        const stream = streamData.data[0];
        const broadcastMessage = stream.game_name
          ? `playing ${stream.game_name}`
          : "streaming no category";
        const viewers = stream.viewer_count === 1 ? "viewer" : "viewers";
        const streamStarted = okayeg.Utils.misc.timeDelta(
          new Date(stream.started_at as string).getTime()
        );

        result = `${context.channel} is ${broadcastMessage} for ${streamStarted} for ${stream.viewer_count} ${viewers} | Title: ${stream.title}`;
      })
      .catch((error) => {
        okayeg.Logger.warn(
          `${pc.yellow(
            "[UPTIME]"
          )} || Error occured while getting steam data from twitch  ${
            error.data.error || error
          }`
        );
        result = "Error occured while getting steam data from twitch.";
      });

    await okayeg.CommandUtils.send(
      context.channel,
      `${context.user.name}, ${result}`,
      context
    );
  },
};
