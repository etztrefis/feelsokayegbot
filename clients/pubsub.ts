import ReconnectingWebSocket from "reconnecting-websocket";
import WS from "ws";
import * as crypto from "crypto";
import * as pc from "picocolors";
import { okayeg } from "..";

type socketMessage = {
  channel: string;
  type: string;
  data?: any;
  viewcount?: any;
};

type socketResponse = {
  type: string;
  error: string;
  nonce: string;
};

const pubsub = new ReconnectingWebSocket("wss://pubsub-edge.twitch.tv", [], {
  debug: false,
  WebSocket: WS,
  startClosed: true,
});

if (okayeg && !Array.isArray(okayeg?.Temp?.pubsubTopics)) {
  okayeg.Temp.pubsubTopics = [];
}

export const connect = async () => {
  pubsub.reconnect();
};

pubsub.addEventListener("open", () => {
  okayeg.Logger.info(
    `${pc.green(
      "[PUBSUB]"
    )} || Connected to Twitch PubSub. Subscribing to topics.`
  );

  (async () => {
    for (const channel of await okayeg.Channel.getListenable()) {
      listenStreamStatus(channel);
      listenChannelPoints(channel);
    }
  })();
});

const listenStreamStatus = async (channel: string) => {
  const channelMeta = await okayeg.Channel.get(channel);
  if (!channelMeta.name) return null;
  const nonce = crypto.randomBytes(20).toString("hex").slice(-8);
  okayeg.Temp.pubsubTopics.push({
    channel: channelMeta.name,
    topic: "video-playback",
    nonce: nonce,
  });
  const message = {
    type: "LISTEN",
    nonce: nonce,
    data: {
      topics: [`video-playback.${channelMeta.name}`],
      auth_token:
        (await okayeg.Utils.cache.get("oauth-token")) || okayeg.Config.token,
    },
  };
  pubsub.send(JSON.stringify(message));
};

const listenChannelPoints = async (channel: string) => {
  const channelMeta = await okayeg.Channel.get(channel);
  if (!channelMeta.name) return null;
  const nonce = crypto.randomBytes(20).toString("hex").slice(-8);
  okayeg.Temp.pubsubTopics.push({
    channel: channelMeta.name,
    topic: "channel-points",
    nonce: nonce,
  });
  const message = {
    type: "LISTEN",
    nonce: nonce,
    data: {
      topics: [`community-points-channel-v1.${channelMeta.userId}`],
      auth_token:(await okayeg.Utils.cache.get("oauth-token")) || okayeg.Config.token,
    },
  };
  pubsub.send(JSON.stringify(message));
};

pubsub.addEventListener("message", (event) => {
  const msg = JSON.parse(event.data);
  switch (msg.type) {
    case "PONG":
      break;
    case "RESPONSE":
      handleSocketResponse(msg);
      break;

    case "MESSAGE":
      if (msg.data) {
        const msgData = JSON.parse(msg.data.message);
        const msgTopic = msg.data.topic;
        switch (msgData.type) {
          case "viewcount":
            handleSocketMessage({
              channel: msgTopic.replace("video-playback.", ""),
              type: msgData.type,
              viewcount: msgData.viewers,
            });
            break;
          case "commercial":
            break;
          case "stream-up":
          case "stream-down":
            handleSocketMessage({
              channel: msgTopic.replace("video-playback.", ""),
              type: msgData.type,
            });
            break;
          case "reward-redeemed":
            handleSocketMessage({
              channel: msgData.data.redemption.channel_id,
              type: msgData.type,
              data: msgData.data.redemption,
            });
            break;
          default:
            okayeg.Logger.warn(
              `${pc.yellow(
                "[PUBSUB]"
              )} || Unknown topic message type: [${msgTopic}] ${JSON.stringify(
                msgData
              )}`
            );
        }
      } else {
        okayeg.Logger.warn(
          `${pc.yellow(
            "[PUBSUB]"
          )} || No data associated with message [${JSON.stringify(msg)}]`
        );
      }
      break;
    case "RECONNECT":
      okayeg.Logger.warn(
        `${pc.yellow(
          "[PUBSUB]"
        )} || Pubsub server sent a reconnect message. restarting the socket`
      );
      pubsub.reconnect();
      break;
    default:
      okayeg.Logger.warn(
        `${pc.yellow("[PUBSUB]")} || Unknown PubSub Message Type: ${msg.type}`
      );
  }
});

const handleSocketMessage = async (msg: socketMessage) => {
  const channelMeta = await okayeg.Channel.get(msg.channel);
  if (!channelMeta.name) return null;
  if (msg) {
    switch (msg.type) {
      case "viewcount":
        await okayeg.Utils.cache.set(
          `streamLive-${channelMeta.name}`,
          true,
          35
        );
        break;
      case "stream-up":
        await okayeg.Utils.cache.set(
          `streamLive-${channelMeta.name}`,
          true,
          35
        );
        okayeg.Logger.debug(
          `${pc.magenta("[PUBSUB]")} || Channel ${channelMeta.name} went live`
        );
        await okayeg.CommandUtils.send(
          channelMeta.name,
          `Okayeg 👉 ${channelMeta.name} IS LIVE`
        );
        break;
      case "stream-down":
        await okayeg.Utils.cache.redis.del(`streamLive-${channelMeta.name}`);
        okayeg.Logger.debug(
          `${pc.magenta("[PUBSUB]")} || Channel ${
            channelMeta.name
          } went offline`
        );
        await okayeg.CommandUtils.send(
          channelMeta.name,
          `Sadeg 👉 ${channelMeta.name} IS OFFLINE`
        );
        break;
      case "reward-redeemed":
        okayeg.Logger.debug(
          `${pc.magenta("[PUBSUB]")} || Reward redeemed on ${channelMeta.name}`
        );
        await okayeg.CommandUtils.send(
          channelMeta.name,
          `Okayeg 👉 POINT REDEMPTION By @${msg.data.user.display_name} -> [${msg.data.reward.title}]`
        );
        break;
    }
  }
};

const handleSocketResponse = (msg: socketResponse) => {
  if (!msg.nonce) {
    return okayeg.Logger.warn(
      `${pc.yellow(
        "[PUBSUB]"
      )} || Unknown message without nonce: ${JSON.stringify(msg)}`
    );
  }
  if (msg.error) {
    return okayeg.Logger.warn(
      `${pc.yellow("[PUBSUB]")} || Error on message with nonce: ${
        msg.nonce
      }, the error is: ${msg.error}`
    );
  } else {
    const { topic, channel } = okayeg.Temp.pubsubTopics.find(
      (i) => i.nonce === msg.nonce
    );
    okayeg.Logger.info(`${pc.green("[PUBSUB]")} || 
      Successfully subscribed to topic ${pc.cyan(
        topic
      )} for channel ${pc.magenta(channel)}`);
  }
};

// Keep alive

setInterval(() => {
  pubsub.send(
    JSON.stringify({
      type: "PING",
    })
  );
}, 250 * 1000);
