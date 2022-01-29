import { Bot, cmdData } from "../types";
import { levels } from "../modules/cooldowns";

export const command = {
  name: "song",
  active: true,
  cooldown: 10000,
  cooldown_mode: levels.CHANNEL,
  author_permission: false,
  description: "Fetches trefis's currently playing song",
  aliases: [],
  run: async (context: cmdData, okayeg: Bot) => {
    const spotifyConnected =
      okayeg.Config.spotifyRefresh &&
      okayeg.Config.spotifyClient &&
      okayeg.Config.spotifySecret;
    const { isLive } = await okayeg.Channel.getByName(context.channel);
    let result: string;
    if (isLive) {
      if (spotifyConnected) {
        try {
          const song = await okayeg.Utils.got.spotify(
            "player/currently-playing"
          );
          if (song) {
            const title = song.item.name;
            const artist = song.item.artists
              .map((artist) => artist.name)
              .join(", ");
            const songUrl = song.item.external_urls.spotify;
            result = `${artist} - ${title} ${songUrl}`;
          } else {
            result = "Nothing is currently playing Sadeg";
          }
        } catch (e) {
          result = "Error occured while getting currently playing song.";
        }
      } else {
        result = "Can't find any spotify tokens in .env file.";
      }
    }else{
      result = "Stream is currently offline :tf:"
    }

    await okayeg.CommandUtils.send(
      context.channel,
      `${context.user.name}, ${result}`,
      context
    );
  },
};
