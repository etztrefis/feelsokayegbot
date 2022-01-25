import { okayeg } from "..";

const getById = async (userId: string) => {
  const channelData = await okayeg.Utils.db.channel.findFirst({
    where: { userId: userId },
  });
  if (!channelData) {
    return undefined;
  }
  return channelData;
};

const getByName = async (name: string) => {
  const channelData = await okayeg.Utils.db.channel.findFirst({
    where: { name: name },
  });
  if (!channelData) {
    return undefined;
  }
  return channelData;
};

const getJoinable = async () => {
  const channels = await okayeg.Utils.db.channel.findMany({
    where: { ignore: false },
  });
  if (!channels) {
    return [];
  }
  const result = channels.map((item) => {
    return item.name;
  });
  return result;
};

const getListenable = async () => {
  const channels = await okayeg.Utils.db.channel.findMany({
    where: { listenStreamStatus: true },
  });
  if (!channels) {
    return [];
  }
  const result = channels.map((item) => {
    return item.userId;
  });
  return result;
};

export { getById, getByName, getJoinable, getListenable };
