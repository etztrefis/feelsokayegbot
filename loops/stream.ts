import * as pc from "picocolors";
import { okayeg } from "..";

export const getInfo = async () => {
  // if bot is initialized
  if (okayeg) {
    okayeg.Logger.info(`${pc.green("[LOOPS]")} || Initializing loops`);
    setInterval(async () => {
      const channels = await okayeg.Utils.db.channel.findMany({
        where: { listenStreamStatus: true },
      });
      channels.forEach((channel) => {
        setTimeout(async () => {
          await okayeg.Utils.got
            .helix(`streams?user_login=${channel.name}`)
            .then(async (response) => {
              if (response.data.length !== 0 && !channel.isLive) {
                okayeg.Logger.debug(
                  `${pc.magenta("[PUBSUB]")} || Channel ${
                    channel.name
                  } went live`
                );
                await okayeg.Utils.db.channel.update({
                  where: { userId: channel.userId },
                  data: { isLive: true },
                });
                await okayeg.CommandUtils.send(
                  channel.name,
                  `Okayeg 👉 ${channel.name} IS NOW LIVE`
                );
                if (channel.name === okayeg.Config.owner) {
                  await okayeg.CommandUtils.send("pwgood", "@Pooshka, HELLO");
                }
              }
              if (response.data.length === 0 && channel.isLive === true) {
                await okayeg.Utils.db.channel.update({
                  where: { userId: channel.userId },
                  data: { isLive: false },
                });
                okayeg.Logger.debug(
                  `${pc.magenta("[PUBSUB]")} || Channel ${
                    channel.name
                  } went offline`
                );
                await okayeg.CommandUtils.send(
                  channel.name,
                  `Sadeg 👉 ${channel.name} IS NOW OFFLINE`
                );
              }
            })
            .catch((error) => {
              return okayeg.Logger.warn(
                `${pc.yellow(
                  "[LOOPS]"
                )} || Error on twitch API request ${error}`
              );
            });
          await okayeg.Utils.got
            .helix(`channels?broadcaster_id=${channel.userId}`)
            .then(async (response) => {
              const newTitle = String(response.data[0].title);
              const newGame = String(response.data[0].game_name);
              if (newTitle !== channel.title) {
                await okayeg.Utils.db.channel.update({
                  where: { userId: channel.userId },
                  data: { title: newTitle, titleTime: new Date() },
                });
                okayeg.Logger.debug(
                  `${pc.magenta("[PUBSUB]")} || New title on channel: ${
                    channel.name
                  }, title: ${pc.cyan(newTitle)}`
                );
                await okayeg.CommandUtils.send(
                  channel.name,
                  `PagMan NEW TITLE 👉 ${newTitle}`
                );
              }
              if (newGame !== channel.game) {
                await okayeg.Utils.db.channel.update({
                  where: { userId: channel.userId },
                  data: { game: newGame, gameTime: new Date() },
                });
                okayeg.Logger.debug(
                  `${pc.magenta("[PUBSUB]")} || New game on channel: ${
                    channel.name
                  }, game: ${pc.cyan(newGame)}`
                );
                await okayeg.CommandUtils.send(
                  channel.name,
                  `PagMan NEW GAME 👉 ${newGame}`
                );
              }
            })
            .catch((error) => {
              return okayeg.Logger.warn(
                `${pc.yellow(
                  "[LOOPS]"
                )} || Error on twitch API request ${error}`
              );
            });
        }, 500);
      });
    }, 20000);
  }
};
