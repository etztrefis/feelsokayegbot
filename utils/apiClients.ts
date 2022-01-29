import axios, { AxiosRequestConfig } from "axios";
import * as qs from "querystring";
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

// Spotify access token
const spotifyAccess = async (config?: AxiosRequestConfig) => {
  const basic = Buffer.from(
    `${okayeg.Config.spotifyClient}:${okayeg.Config.spotifySecret}`
  ).toString("base64");
  const { data } = await axios.request({
    url: `https://accounts.spotify.com/api/token`,
    timeout: 1500,
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basic}`,
    },
    data: qs.stringify({
      grant_type: "refresh_token",
      refresh_token: okayeg.Config.spotifyRefresh,
    }),
    ...config,
  });
  return data;
};

// Spotify API
export const spotify = async (link: string, config?: AxiosRequestConfig) => {
  const { access_token } = await spotifyAccess();
  const { data } = await axios.request({
    url: `https://api.spotify.com/v1/me/${link}`,
    timeout: 1500,
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
    ...config,
  });
  return data;
};
