import { okayeg } from "..";
import { cmdData, options } from "../types";

enum levels {
  USERCOMMAND = "UserCommand",
  DISABLED = "Disabled",
  USER = "User",
  CHANNEL = "Channel",
}

enum mods {
  ADD = "add",
  CHECK = "check",
}

const cooldownOptions = async (cmdData: cmdData, options: options) => {
  if (!options.level) options.level = levels.USERCOMMAND;
  if (!options.mode) options.mode = mods.ADD;

  const prefix = `cooldown-${cmdData.channelId}`;

  if (options.mode === "add") {
    if (cmdData?.commandMeta?.bypassCooldown) {
      return false;
    }

    if (options.level === "Disabled") {
      return false;
    }

    // if command cooldowns user for all commands
    if (options.level === "User") {
      await okayeg.Utils.cache.setpx(
        `${prefix}-${cmdData?.user?.id}`,
        true,
        cmdData?.commandMeta?.cooldown || okayeg.Config.userCooldown
      );
      return true;
    }

    // if command cooldowns channel for all commands
    if (options.level === "Channel") {
      await okayeg.Utils.cache.setpx(
        `${prefix}-${cmdData.command}`,
        true,
        cmdData?.commandMeta?.cooldown || okayeg.Config.defaultCooldown
      );
      return true;
    }

    // if command cooldowns specified user for specified command
    if (options.level === "UserCommand") {
      await okayeg.Utils.cache.setpx(
        `${prefix}-${cmdData?.user?.id}-${cmdData.command}`,
        true,
        cmdData?.commandMeta?.cooldown || okayeg.Config.userCooldown
      );
      return true;
    }
  }
  if (options.mode === "check") {
    if (cmdData?.commandMeta?.bypassCooldown) {
      return false;
    }

    if (await okayeg.Utils.cache.get(`${prefix}-${cmdData.command}`)) {
      return true;
    }
    if (
      await okayeg.Utils.cache.get(
        `${prefix}-${cmdData?.user?.id}-${cmdData.command}`
      )
    ) {
      return true;
    }
    return false;
  }
};

export { levels, mods, cooldownOptions };
