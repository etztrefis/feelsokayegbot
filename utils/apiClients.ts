import axios, { AxiosRequestConfig } from "axios";
import { okayeg } from "..";

// Generic GET requests
export const twitchAuth = async (link: string, config?: AxiosRequestConfig) => {
  const { data } = await axios.request({
    url: `https://id.twitch.tv/${link}`,
    ...config,
  });
  return data;
};

// Twitch API v5
export const kraken = async (link: string, config?: AxiosRequestConfig) => {
  const { data } = await axios.request({
    url: `https://api.twitch.tv/kraken/${link}`,
    timeout: 1500,
    headers: {
      "Client-ID": okayeg.Config.clientId,
      Accept: "application/vnd.twitchtv.v5+json",
    },
    ...config,
  });
  return data;
};

// Twitch Helix API
export const helix = async (link: string, config?: AxiosRequestConfig) => {
  const { data } = await axios.request({
    url: `https://api.twitch.tv/helix/${link}`,
    timeout: 1500,
    headers: {
      "Client-ID": okayeg.Config.clientId,
      Authorization: `Bearer ${okayeg.Config.bearer}`,
    },
    ...config,
  });
  return data;
};

// Twitch TMI API
export const tmi = async (link: string, config?: AxiosRequestConfig) => {
  const { data } = await axios.request({
    url: `https://tmi.twitch.tv/${link}`,
    timeout: 3500,
    ...config,
  });
  return data;
};
