import { NestedChatClient } from "./clients";
import { IRCMessageTags, TwitchBadgesList } from "dank-twitch-irc";
import { PrismaClient, Channel } from "@prisma/client";
import { Redis, KeyType } from "ioredis";
import { mods, levels } from "./modules/cooldowns";

interface Bot {
  Config?: botConfig;
  Twitch?: NestedChatClient;
  Logger?: botLogger;
  Temp?: botTemp;
  Utils?: botUtils;
  Channel?: botChannel;
  CommandUtils?: botCommandUtils;
  Cooldown?: (cmdData: cmdData, options: options) => Promise<boolean>;
  Commands?: botCommand[];
}

type botConfig = {
  //main twitch user setting
  username: string;
  password: string;
  clientId: string;
  clientSecret: string;
  token: string;
  bearer: string;
  botId: string;

  //actual config
  owner: string;
  prefix: string;
  msgLengthLimit: number;

  //cooldown settings
  defaultCooldown: number;
  userCooldown: number;

  //database connection settings
  //api tokens
};

type botLogger = {
  info: (message: string) => void;
  error: (message: string) => void;
  warn: (message: string) => void;
  debug: (message: string) => void;
};

type botCommand = {
  command: nestedBotCommand;
};

type nestedBotCommand = {
  name: string;
  aliases: string[];
  description?: string;
  cooldown?: number;
  bypassCooldown?: boolean;
  cooldown_mode?: levels;
  // permission?: string[]; TODO: mod, vip, etc
  author_permission: boolean;
  active: boolean;
  run: (context: cmdData, okayeg: Bot) => Promise<void>;
};

type botCommandUtils = {
  send: (channel: string, message: string, cmdData: cmdData) => Promise<void>;
  sendError: (channel: string, message: string) => void;
};

type botUtils = {
  db: PrismaClient;
  misc: botUtilsMisc;
  cache: botCacheUtils;
  loadCommands: () => void;
};

type botCacheUtils = {
  redis: Redis;
  set: (key: KeyType, data: boolean, expiry?: number) => Promise<void>;
  get: (key: KeyType) => Promise<any>;
  setpx: (key: KeyType, data: boolean, expiry?: number) => Promise<void>;
};

type botTemp = {
  cmdCount: number;
  commandsDir: string;
};

type botChannel = {
  get: (channel: string) => Promise<Channel | undefined>;
  getJoinable: () => Promise<string[]>;
};

type botUtilsMisc = {
  uptime: () => any;
  logError: (name: string, reason: string, stack: string) => Promise<void>;
  updateBannedState: (channelId: string, isBanned: boolean) => Promise<void>;
};

type cmdData = {
  user?: cmdDataUser;
  message?: cmdDataMessage;
  type: string;
  command: string;
  channel: string;
  channelMeta: Channel | {};
  channelId: string;
  userState: IRCMessageTags;
  client: NestedChatClient;
  commandMeta?: nestedBotCommand;
};

type cmdDataUser = {
  id: string;
  name: string;
  login: string;
  color: string;
  badges: TwitchBadgesList;
};

type cmdDataMessage = {
  raw: string;
  text: string;
  args: string[];
};

type options = {
  level?: levels;
  mode?: mods;
};
