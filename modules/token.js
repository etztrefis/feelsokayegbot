/* eslint-disable camelcase */
module.exports.check = async () => {
    let token = fob.Config.token;
    if (!token) {
        fob.Logger.warn('Token has expired. Refreshing the token.');
        await fetchToken();
        token = await fob.Utils.cache.get('oauth-token');
    }
    try {
        await fob.Utils.got
            .twitchAuth('oauth2/validate', {
                headers: {Authorization: `OAuth ${token}`},
            })
            .json();
    } catch (error) {
        if (error instanceof fob.Utils.got.twitchAuth.HTTPError) {
            fob.Logger.warn(
                'Got an unexpected return code while checking token validity. Assuming the token is invalid. Will create a new token.',
            );
            await fetchToken();
        } else {
            throw new Error(`Error Fetching token: ${error}`);
        }
    }
    fob.Twitch.configuration.password = token;
};

const fetchToken = async () => {
    const refreshToken = await fob.Utils.cache.get('refresh-token');
    if (!refreshToken) {
        fob.Logger.warn('No refresh token present. Cannot create a token.');
    }
    const {
        access_token,
        expires_in,
        refresh_token,
    } = await fob.Utils.got.twitchAuth
        .post('oauth2/token', {
            searchParams: {
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: fob.Config.clientid,
                client_secret: fob.Config.clientsecret,
            },
        })
        .json();

    await fob.Utils.cache.set(
        'oauth-token',
        access_token,
        (expiry = expires_in),
    );
    await fob.Utils.cache.set('refresh-token', refresh_token, (expiry = 0));
};

setInterval(async () => {
    await fob.Modules.token.check();
}, 60000);
