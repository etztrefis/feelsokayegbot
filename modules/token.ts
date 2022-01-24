import { okayeg } from "..";
import * as pc from "picocolors";

export const check = async () => {
  let token = okayeg.Config.token;
  if (!token) {
    okayeg.Logger.warn(
      `${pc.yellow("[TOKEN]")} || Token has expired. Refreshing the token`
    );
    await fetchToken();
    token = await okayeg.Utils.cache.get("oauth-token");
  }

  try {
    okayeg.Logger.info(`${pc.green("[TOKEN]")} || Token found. Validating.`);
    await okayeg.Utils.got.twitchAuth("oauth2/validate", {
      headers: { Authorization: `OAuth ${token}` },
    });
  } catch (error) {
    okayeg.Logger.warn(
      `${pc.yellow(
        "[TOKEN]"
      )} || Got an unexpected return code while checking token validity. Assuming the token is invalid. Will create a new token.`
    );
    await fetchToken();
    okayeg.Twitch.configuration.password = token;
  }
};

const fetchToken = async () => {
  const refreshToken = await okayeg.Utils.cache.get("refresh-token");
  if (!refreshToken) {
    okayeg.Logger.warn(
      `${pc.yellow(
        "[TOKEN]"
      )} || No refresh token present. Cannot create a token.`
    );
  }

  const { access_token, expires_in, refresh_token } =
    await okayeg.Utils.got.twitchAuth("oauth2/token", {
      method: "POST",
      params: {
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: okayeg.Config.clientId,
        client_secret: okayeg.Config.clientSecret,
      },
    });

  await okayeg.Utils.cache.set("oauth-token", access_token, expires_in);
  await okayeg.Utils.cache.set("refresh-token", refresh_token, 0);
};

setInterval(async () => {
  check();
}, 600000);
