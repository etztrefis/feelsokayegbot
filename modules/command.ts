import { okayeg } from "..";
import * as pc from "picocolors";
import { SayError } from "dank-twitch-irc";
import { cmdData } from "../types";
import { levels } from "./cooldowns";

const send = async (channel: string, message: string, cmdData: cmdData) => {
  try {
    let lengthLimit = okayeg.Config.msgLengthLimit;
    lengthLimit -= 2;
    let truncatedMessage = message.substring(0, lengthLimit);
    if (truncatedMessage.length < message.length) {
      truncatedMessage = `${message.substring(0, --lengthLimit)}...`;
    }

    await okayeg.Cooldown(cmdData, {
      level: cmdData?.commandMeta.cooldown_mode || levels.USERCOMMAND,
    });

    await okayeg.Twitch.privmsg(channel, truncatedMessage);
  } catch (error) {
    if (
      error instanceof SayError &&
      error.message.includes("@msg-id=msg_rejected")
    ) {
      await okayeg.Twitch.privmsg(
        channel,
        "That message violates the channel automod settings."
      );
    }
    if (
      error instanceof SayError &&
      error.message.includes("@msg-id=msg_duplicate")
    ) {
      await okayeg.Twitch.privmsg(
        channel,
        "That message was a duplicate FeelsDankMan"
      );
    }
    await okayeg.Twitch.privmsg(
      channel,
      "Error while processing the reply message monkaS"
    );
    okayeg.Logger.error(
      `${pc.red(
        "[MESSAGE ERROR]"
      )} || Error while processing the reply message: ${error.message} `
    );
    okayeg.Utils.misc.logError("SendError", error.message, error.stack);
  }
};

const sendError = (channel: string, message: string) => {
  okayeg.Twitch.sendRaw(`PRIVMSG #${channel} :${message}`);
};

export { send, sendError };
