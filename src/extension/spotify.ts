import express from 'express';
import { NodeCG } from './nodecg';
import SpotifyWebApi = require('spotify-web-api-node');

export const spotify = async (nodecg: NodeCG): Promise<void> => {
    const logger = new nodecg.Logger('nodecg-spotify-widget:spotify');
    const config = nodecg.bundleConfig.spotify;
    if (!config || !config.clientId || !config.clientSecret || !config.redirectUri) {
        logger.warn('Spotify client ID, secret or redirect URI is not defined.');
        return;
    }

    let callApiInterval: NodeJS.Timeout;
    let refreshInterval: NodeJS.Timeout;
    const app = express();
    const spotifyApi = new SpotifyWebApi({
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        redirectUri: config.redirectUri
    });

    const spotifyPlayingTrack = nodecg.Replicant('spotifyPlayingTrack', {
        defaultValue: null
    });
    const spotifyTokensRep = nodecg.Replicant('spotifyTokens', {
        defaultValue: {}
    });
    const spotifyStatusRep = nodecg.Replicant('spotifyStatus', {
        defaultValue: 'unauthorized'
    });
    const spotifyUserData = nodecg.Replicant('spotifyUserData', {
        defaultValue: {}
    });
    const spotifyContextRep = nodecg.Replicant('spotifyPlayingContext', {
        defaultValue: null
    });
    
    const getUserProfile = async (): Promise<void> => {
        try {
            const profile = await spotifyApi.getMe();
            spotifyUserData.value = {
                name: profile.body.display_name,
                uri: profile.body.uri
            };
        } catch (err) {
            logger.warn(err);
        }
    }

    const clearUserProfile = (): void => {
        spotifyUserData.value = {};
    }

    const getPlayingTrack = async (): Promise<void> => {
        try {
            const track = await spotifyApi.getMyCurrentPlayingTrack();
            const item = track.body.item;
            if (item?.name && item.artists) {
                spotifyPlayingTrack.value = {
                    name: item.name,
                    artists: item.artists.map((artist) => {
                        return artist.name;
                    }),
                    albumName: item.album.name
                }
            }
        } catch (err) {
            logger.warn(err);
        }
    }

    const getCurrentlyPlayingContext = async (): Promise<void> => {
        try {
            const context = await spotifyApi.getMyCurrentPlaybackState();
            const body = context.body;
            spotifyContextRep.value = body;
        } catch (err) {
            logger.warn(err);
        }
    }

    const clearPlayingTrack = (): void => {
        spotifyPlayingTrack.value = null;
    }

    const logout = (): void => {
        spotifyStatusRep.value = 'unauthorized';
        spotifyTokensRep.value = {};
        clearInterval(refreshInterval);
        clearInterval(callApiInterval);
        clearPlayingTrack();
        clearUserProfile();
        logger.info('Reset spotify API authorization data.');
    }
    nodecg.listenFor('spotify:logout', logout);

    const refreshToken = async (): Promise<void> => {
        try {
            const refreshResponse = await spotifyApi.refreshAccessToken();
            spotifyApi.setAccessToken(refreshResponse.body.access_token);
            spotifyTokensRep.value = {
                accessToken: spotifyApi.getAccessToken(),
                refreshToken: spotifyApi.getRefreshToken(),
                expiresIn: spotifyTokensRep.value.expiresIn
            };
            spotifyStatusRep.value = 'authorized';
            logger.info('Refreshed access token.');
        } catch (err) {
            logger.warn(err);
            logout();
        }
    }

    const setRefreshInterval = (expiresIn: number): void => {
        if (refreshInterval) {
            clearInterval(refreshInterval);
        }
        refreshInterval = setInterval(refreshToken, (expiresIn - 60) * 1000);
    }

    const setCallApiInterval = (): void => {
        if (callApiInterval) {
            clearInterval(callApiInterval);
        }
        callApiInterval = setInterval(() => {
            getPlayingTrack();
            getUserProfile();
            getCurrentlyPlayingContext();
        }, 2000);
    }

    if (spotifyTokensRep.value.accessToken && spotifyTokensRep.value.refreshToken && spotifyTokensRep.value.expiresIn) {
        spotifyApi.setAccessToken(spotifyTokensRep.value.accessToken);
        spotifyApi.setRefreshToken(spotifyTokensRep.value.refreshToken);
        await refreshToken();
        setRefreshInterval(spotifyTokensRep.value.expiresIn);
        setCallApiInterval();
    }

    app.get('/nodecg-spotify-widget/spotify_callback', (req, res) => {
        spotifyStatusRep.value = 'authenticating';
        const authCode = req.query.code;
        if (authCode) {
            spotifyApi.authorizationCodeGrant(authCode)
            .then((data) => {
                spotifyTokensRep.value = {
                    accessToken: data.body.access_token,
                    refreshToken: data.body.refresh_token,
                    expiresIn: data.body.expires_in
                };
                logger.info('Success to authorize to Spotify!');
                spotifyStatusRep.value = 'authorized';
                spotifyApi.setAccessToken(data.body.access_token);
                spotifyApi.setRefreshToken(data.body.refresh_token);
                setRefreshInterval(data.body.expires_in);
                setCallApiInterval();
                res.send('<b>Authorized to Spotify!</b><br />Feel free to close this window. Make sure to "authorized" spotify status.');
            })
            .catch((err) => {
                logger.warn('Failed to authorize to Spotify.');
                logger.warn(err);
                logout();
                res.send('<b>Failed to authorize, Please try again.</b>')
            })
        } else {
            logout();
            res.send('No code in query, this page only use for spotify auto')
        }
    })
    nodecg.mount(app);

}