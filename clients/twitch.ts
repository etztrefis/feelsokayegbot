import {
  AlternateMessageModifier,
  SlowModeRateLimiter,
  ChatClient,
  LoginError,
  JoinError,
  SayError,
  PrivmsgMessage,
} from "dank-twitch-irc";
import * as pc from "picocolors";
import * as dotenv from "dotenv";
import { okayeg } from "..";
import { botConfig, cmdData } from "../types";

dotenv.config({ path: ".env" });

class NestedChatClient extends ChatClient {
  initialize: () => Promise<void>;
}

const config: botConfig = {
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
  clientId: process.env.CLIENTID,
  bearer: process.env.BEARER,
  clientSecret: process.env.CLIENTSECRET,
  token: process.env.TOKEN,
  prefix: process.env.PREFIX,
  userCooldown: Number(process.env.USERCD),
  defaultCooldown: Number(process.env.DEFAULTCD),
  msgLengthLimit: Number(process.env.MSGLENGTHLIMIT),
  owner: Number(process.env.OWNER),
  botId: process.env.BOTID,
};

const client = new NestedChatClient({
  username: config.username,
  password: config.password,
  rateLimits: "default",
});

client.use(new AlternateMessageModifier(client));
client.use(new SlowModeRateLimiter(client, 10));

client.initialize = async () => {
  const channels = await okayeg.Channel.getJoinable();
  await client.joinAll(channels);
  client.connect();
};

client.on("ready", async () => {
  okayeg.Logger.info(`${pc.green("[CONNECTED]")} || Connected to Twitch 🥶`);
  await client.say("trefis", "CODINK");
  await client.say("rilaveon", "YEAHBUT7TV");
});

client.on("error", (error) => {
  if (error instanceof LoginError) {
    return okayeg.Logger.warn(
      `${pc.red("[LOGIN]")} || Error logging in to Twitch: ${error}`
    );
  }
  if (error instanceof JoinError) {
    return okayeg.Logger.warn(
      `${pc.red("[JOIN]")} || Error joining channel ${
        error.failedChannelName
      } : ${error}`
    );
  }
  if (error instanceof SayError) {
    return okayeg.Logger.warn(
      `${pc.red("[SAY]")} || Error sending message in: ${
        error.failedChannelName
      } : ${error.cause} | ${error.message}`
    );
  }
  okayeg.Logger.error(`${pc.red("[ERROR]")} || Error occured in DTI: ${error}`);
});

client.on("CLEARCHAT", async (msg) => {
  if (msg.isTimeout()) {
    okayeg.Logger.warn(
      `${pc.yellow("[TIMEOUT]")} ${msg.targetUsername} got timed out in ${
        msg.channelName
      } for ${msg.banDuration} seconds`
    );
    //TODO: check if bot is timed out and put that info on to the redis
  }
  if (msg.isPermaban) {
    okayeg.Logger.warn(
      `${pc.yellow("[BAN]")} ${msg.targetUsername} got banned in ${
        msg.channelName
      }`
    );
    if (
      msg.ircTags["target-user-id"] &&
      msg.ircTags["target-user-id"] === okayeg.Config.botId
    ) {
      await okayeg.Utils.misc.updateBannedState(
        msg.ircTags["target-user-id"],
        true
      );
    }
  }
  if (msg.wasChatCleared()) {
    okayeg.Logger.warn(
      `${pc.yellow("[CLEARCHAT]")} Chat was cleared in ${msg.channelName}`
    );
  }
});

client.on("NOTICE", async ({ channelName, messageID, messageText }) => {
  if (!messageID) {
    return;
  }
  switch (messageID) {
    case "msg_rejected":
    case "msg_rejected_mandatory": {
      okayeg.Logger.debug(
        `${pc.cyan(
          "[NOTICE]"
        )} || Received msg_rejected/mandatory from ${channelName} -> ${messageText}`
      );
    }
    case "no_permission": {
      okayeg.Logger.debug(
        `${pc.cyan(
          "[NOTICE]"
        )} || Received no_permission from ${channelName} -> ${messageText}`
      );
    }
    case "host_on": {
      okayeg.Logger.info(
        `${pc.cyan("[NOTICE]")} || Received host_on on ${channelName}`
      );
    }
    case "host_target_went_offline": {
      okayeg.Logger.info(
        `${pc.cyan(
          "[NOTICE]"
        )} || Received host_target_went_offline on ${channelName}`
      );
    }
    default: {
      okayeg.Logger.debug(
        `${pc.cyan(
          "[NOTICE]"
        )} || Incoming notice: ${messageID} is channel ${channelName} -> ${messageText}`
      );
    }
  }
});

client.on("PRIVMSG", (msg) => handleUserMessage(msg));

const handleUserMessage = async (msg: PrivmsgMessage) => {
  const type = "privmsg";
  const message = msg.messageText;
  const content = message.split(/\s+/g);
  const command = content[0];
  const commandString = command.slice(okayeg.Config.prefix.length);
  const channelMeta = await okayeg.Channel.get(msg.channelID);
  const args = content.slice(1);

  const commandData: cmdData = {
    user: {
      id: msg.senderUserID,
      name: msg.displayName,
      login: msg.senderUsername,
      color: msg.colorRaw,
      badges: msg.badges,
    },
    message: {
      raw: msg.rawSource,
      text: message,
      args: args,
    },
    type: type,
    command: commandString,
    channel: msg.channelName,
    channelId: msg.channelID,
    channelMeta: channelMeta,
    userState: msg.ircTags,
  };

  // Update bot status in database
  if (msg.senderUsername === okayeg.Config.username && channelMeta) {
    const currentMode = channelMeta.mode;
    if (msg.badges) {
      if (msg.badges.hasModerator || msg.badges.hasBroadcaster) {
        channelMeta.mode = "Moderator";
      } else if (msg.badges.hasVIP) {
        channelMeta.mode = "VIP";
      } else {
        channelMeta.mode = "Chatter";
      }
      if (currentMode !== channelMeta.mode) {
        await okayeg.Utils.db.channel
          .update({
            where: { userId: msg.channelID },
            data: {
              mode: channelMeta.mode,
            },
          })
          .catch((error) => {
            if (error.name && error.message && error.stack) {
              okayeg.Logger.warn(
                `${pc.yellow("[PRISMA ERROR]")} || ${error.name} -> ${
                  error.message
                } || ${error.stack}`
              );
            }
          });
      }
    }
  }

  // Ignore any messages from self
  if (msg.senderUsername == okayeg.Config.username) {
    return;
  }

  //TODO: check in redis if the bot is timed out -> do not process anything

  if (channelMeta.ignore === true) {
    return;
  }

  // Input is a command -> process it as such
  if(msg.messageText.startsWith(okayeg.Config.prefix)){
    
  }

};

export { client, config, NestedChatClient };
