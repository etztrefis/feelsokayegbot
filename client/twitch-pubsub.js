const RWS = require('reconnecting-websocket');
const WS = require('ws');
const chalk = require('chalk');
const crypto = require('crypto');

const ps = new RWS('wss://pubsub-edge.twitch.tv', [], {
    WebSocket: WS,
    startClosed: true,
});

if (!Array.isArray(fob.Temp.pubsubTopics)) {
    fob.Temp.pubsubTopics = [];
}

module.exports.connect = () => {
    ps.reconnect();
};

ps.addEventListener('open', async () => {
    fob.Logger.info(
        `${chalk.green(
            '[CONNECTED]',
        )} || Connected to Twitch PubSub. Subscribing to topics.`,
    );
    for (const channel of await fob.Channel.getJoinable()) {
        listenStreamStatus(channel);
        listenChannelPoints(channel);
    }
});

ps.addEventListener('message', ({data}) => {
    const msg = JSON.parse(data);
    switch (msg.type) {
    case 'PONG':
        break;

    case 'RESPONSE':
        handleWSResp(msg);
        break;

    case 'MESSAGE':
        if (msg.data) {
            const msgData = JSON.parse(msg.data.message);
            const msgTopic = msg.data.topic;
            switch (msgData.type) {
            case 'viewcount':
                handleWSMsg({
                    channel: msgTopic.replace('video-playback.', ''),
                    type: msgData.type,
                    viewcount: msgData.viewers,
                });
                break;
            case 'commercial':
                break;
            case 'stream-up':
            case 'stream-down':
                handleWSMsg({
                    channel: msgTopic.replace('video-playback.', ''),
                    type: msgData.type,
                });
                break;
            case 'reward-redeemed':
                handleWSMsg({
                    channel: msgData.data.redemption.channel_id,
                    type: msgData.type,
                    data: msgData.data.redemption,
                });
                break;
            default:
                fob.Logger.warn(
                    `Unknown topic message type: [${msgTopic}] ${JSON.stringify(
                        msgData,
                    )}`,
                );
            }
        } else {
            fob.Logger.warn(
                `No data associated with message [${JSON.stringify(msg)}]`,
            );
        }
        break;
    case 'RECONNECT':
        fob.Logger.warn(
            'Pubsub server sent a reconnect message. restarting the socket',
        );
        ps.reconnect();
        break;
    default:
        fob.Logger.warn(`Unknown PubSub Message Type: ${msg.type}`);
    }
});

const listenStreamStatus = async (channel) => {
    console.log('streamstatus ' + channel);
    const channelMeta = await fob.Channel.get(channel);
    if (!channelMeta.Name) return null;
    if (!channelMeta.listenStreamStatus) return null;
    cnosole.log(1);
    const nonce = crypto.randomBytes(20).toString('hex').slice(-8);
    fob.Temp.pubsubTopics.push({
        channel: channelMeta.Name,
        topic: 'video-playback',
        nonce: nonce,
    });
    cnosole.log(2);
    const message = {
        type: 'LISTEN',
        nonce: nonce,
        data: {
            topics: [`video-playback.${channelMeta.Name}`],
            auth_token: await fob.Utils.cache.get('oauth-token'),
        },
    };
    console.log(message);
    await ps.send(JSON.stringify(message));
    console.log('streamstatus done');
};

const listenChannelPoints = async (channel) => {
    console.log('channelpoints top');
    const channelMeta = await sc.Channel.get(channel);
    if (!channelMeta.Name) return null;
    if (!channelMeta.Extra.listenChannelPoints) return null;
    const nonce = crypto.randomBytes(20).toString('hex').slice(-8);
    sc.Temp.pubsubTopics.push({
        channel: channelMeta.Name,
        topic: 'channel-points',
        nonce: nonce,
    });
    const message = {
        type: 'LISTEN',
        nonce: nonce,
        data: {
            topics: [`community-points-channel-v1.${channelMeta.Platform_ID}`],
            auth_token: await sc.Utils.cache.get('oauth-token'),
        },
    };
    console.log(message);
    ps.send(JSON.stringify(message));
    console.log('channelpoints done');
};

const handleWSMsg = async (msg = {}) => {
    const channelMeta = await fob.Channel.get(msg.channel);
    if (!channelMeta.Name) return null;
    if (msg) {
        s;
        switch (msg.type) {
        case 'viewcount':
            await fob.Utils.cache.set(
                `streamLive-${channelMeta.Name}`,
                'true',
                35,
            );
            break;
        case 'stream-up':
            await fob.Utils.cache.set(
                `streamLive-${channelMeta.Name}`,
                'true',
                35,
            );
            if (!channelMeta.streamLive) {
                fob.Logger.debug(`Channel ${channelMeta.Name} went live`);
                channelMeta.streamLive = true;
                if (channelMeta.Name === 'trefis') {
                    await fob.Twitch.say(
                        fob.Config.owner,
                        'Okayeg 👉 Channel is live!',
                    );
                }
            }
            break;
        case 'stream-down':
            await fob.Utils.cache.redis.del(
                `streamLive-${channelMeta.Name}`,
            );
            fob.Logger.debug(`Channel ${channelMeta.Name} went offline`);
            channelMeta.streamLive = false;
            if (channelMeta.Name === 'trefis') {
                await fob.Twitch.say(
                    fob.Config.owner,
                    'Okayeg 👉 Channel is offline!',
                );
            }
            break;
        case 'reward-redeemed':
            await fob.Twitch.say(
                fob.Config.owner,
                `Okayeg 👉 CHANNELPOINTREDEMPTIONDETECTED By ${msg.data.user.display_name} -> [${msg.data.reward.title}]`,
            );
            break;
        }
    }
};

const handleWSResp = (msg) => {
    if (!msg.nonce) {
        return fob.Logger.warn(
            `Unknown message without nonce: ${JSON.stringify(msg)}`,
        );
    }

    const {topic} = fob.Temp.pubsubTopics.find((i) => i.nonce === msg.nonce);
    fob.Logger.info(
        `Successfully subscribed to topic ${chalk.cyan(
            topic,
        )} for channel ${chalk.magenta(Name)}`,
    );
};

// Keep alive

setInterval(() => {
    ps.send(
        JSON.stringify({
            type: 'PING',
        }),
    );
}, 250 * 1000);
