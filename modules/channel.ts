import { okayeg } from "..";

const get = async (userId: string) => {
  const channelData = await okayeg.Utils.db.channel.findFirst({
    where: { userId: userId },
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

export { get, getJoinable };
