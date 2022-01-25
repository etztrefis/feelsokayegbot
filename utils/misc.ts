import * as humanize from "humanize-duration";
import { okayeg } from "..";

const shortHumanize = humanize.humanizer({
  language: "shortEn",
  languages: {
    shortEn: {
      y: () => "y",
      mo: () => "mo",
      w: () => "w",
      d: () => "d",
      h: () => "h",
      m: () => "m",
      s: () => "s",
      ms: () => "ms",
    },
  },
});

const uptime = () => {
  const ms = process.uptime() * 1000;
  return shortHumanize(ms, {
    units: ["w", "d", "h", "m", "s"],
    largest: 4,
    round: true,
    conjunction: "",
    spacer: "",
  });
};

const logError = async (name: string, reason: string, stack: string) => {
  await okayeg.Utils.db.log.create({
    data: {
      name: name,
      message: reason,
      stack: stack,
    },
  });
};

const updateBannedState = async (channelId: string, isBanned: boolean) => {
  await okayeg.Utils.db.channel.update({
    where: { userId: channelId },
    data: {
      ignore: isBanned,
    },
  });
};

export { uptime, logError, updateBannedState };
