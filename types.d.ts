import { NestedChatClient } from "./clients";
import { IRCMessageTags, TwitchBadgesList } from "dank-twitch-irc";
import { PrismaClient, Channel } from "@prisma/client";

interface Bot {
  Config?: botConfig;
  Twitch?: NestedChatClient;
  Logger?: botLogger;
  Temp?: botTemp;
  Utils?: botUtils;
  Channel?: botChannel;
  Commands?: botCommand;
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
  owner: number;
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
  run: () => void;
  name: string;
};

type botUtils = {
  db: PrismaClient;
  misc: botUtilsMisc;
};

type botTemp = {
  cmdCount: number;
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
