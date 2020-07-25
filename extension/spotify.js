"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var express_1 = tslib_1.__importDefault(require("express"));
var SpotifyWebApi = require("spotify-web-api-node");
exports.spotify = function (nodecg) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
    var logger, config, callApiInterval, refreshInterval, app, spotifyApi, spotifyPlayingTrack, spotifyTokensRep, spotifyStatusRep, spotifyUserData, spotifyContextRep, getUserProfile, clearUserProfile, getPlayingTrack, getCurrentlyPlayingContext, clearPlayingTrack, logout, refreshToken, setRefreshInterval, setCallApiInterval;
    return tslib_1.__generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                logger = new nodecg.Logger('nodecg-spotify-widget:spotify');
                config = nodecg.bundleConfig.spotify;
                if (!config || !config.clientId || !config.clientSecret || !config.redirectUri) {
                    logger.warn('Spotify client ID, secret or redirect URI is not defined.');
                    return [2 /*return*/];
                }
                app = express_1.default();
                spotifyApi = new SpotifyWebApi({
                    clientId: config.clientId,
                    clientSecret: config.clientSecret,
                    redirectUri: config.redirectUri
                });
                spotifyPlayingTrack = nodecg.Replicant('spotifyPlayingTrack', {
                    defaultValue: null
                });
                spotifyTokensRep = nodecg.Replicant('spotifyTokens', {
                    defaultValue: {}
                });
                spotifyStatusRep = nodecg.Replicant('spotifyStatus', {
                    defaultValue: 'unauthorized'
                });
                spotifyUserData = nodecg.Replicant('spotifyUserData', {
                    defaultValue: {}
                });
                spotifyContextRep = nodecg.Replicant('spotifyPlayingContext', {
                    defaultValue: null
                });
                getUserProfile = function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                    var profile, err_1;
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, spotifyApi.getMe()];
                            case 1:
                                profile = _a.sent();
                                spotifyUserData.value = {
                                    name: profile.body.display_name,
                                    uri: profile.body.uri
                                };
                                return [3 /*break*/, 3];
                            case 2:
                                err_1 = _a.sent();
                                logger.warn(err_1);
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); };
                clearUserProfile = function () {
                    spotifyUserData.value = {};
                };
                getPlayingTrack = function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                    var track, item, err_2;
                    var _a;
                    return tslib_1.__generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                _b.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, spotifyApi.getMyCurrentPlayingTrack()];
                            case 1:
                                track = _b.sent();
                                item = track.body.item;
                                if (((_a = item) === null || _a === void 0 ? void 0 : _a.name) && item.artists) {
                                    spotifyPlayingTrack.value = {
                                        name: item.name,
                                        artists: item.artists.map(function (artist) {
                                            return artist.name;
                                        })
                                    };
                                }
                                return [3 /*break*/, 3];
                            case 2:
                                err_2 = _b.sent();
                                logger.warn(err_2);
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); };
                getCurrentlyPlayingContext = function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                    var context, body, err_3;
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, spotifyApi.getMyCurrentPlaybackState()];
                            case 1:
                                context = _a.sent();
                                body = context.body;
                                spotifyContextRep.value = body;
                                return [3 /*break*/, 3];
                            case 2:
                                err_3 = _a.sent();
                                logger.warn(err_3);
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); };
                clearPlayingTrack = function () {
                    spotifyPlayingTrack.value = null;
                };
                logout = function () {
                    spotifyStatusRep.value = 'unauthorized';
                    spotifyTokensRep.value = {};
                    clearInterval(refreshInterval);
                    clearInterval(callApiInterval);
                    clearPlayingTrack();
                    clearUserProfile();
                    logger.info('Reset spotify API authorization data.');
                };
                nodecg.listenFor('spotify:logout', logout);
                refreshToken = function () { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
                    var refreshResponse, err_4;
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, spotifyApi.refreshAccessToken()];
                            case 1:
                                refreshResponse = _a.sent();
                                spotifyApi.setAccessToken(refreshResponse.body.access_token);
                                spotifyTokensRep.value = {
                                    accessToken: spotifyApi.getAccessToken(),
                                    refreshToken: spotifyApi.getRefreshToken(),
                                    expiresIn: spotifyTokensRep.value.expiresIn
                                };
                                spotifyStatusRep.value = 'authorized';
                                logger.info('Refreshed access token.');
                                return [3 /*break*/, 3];
                            case 2:
                                err_4 = _a.sent();
                                logger.warn(err_4);
                                logout();
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); };
                setRefreshInterval = function (expiresIn) {
                    if (refreshInterval) {
                        clearInterval(refreshInterval);
                    }
                    refreshInterval = setInterval(refreshToken, (expiresIn - 60) * 1000);
                };
                setCallApiInterval = function () {
                    if (callApiInterval) {
                        clearInterval(callApiInterval);
                    }
                    callApiInterval = setInterval(function () {
                        getPlayingTrack();
                        getUserProfile();
                        getCurrentlyPlayingContext();
                    }, 2000);
                };
                if (!(spotifyTokensRep.value.accessToken && spotifyTokensRep.value.refreshToken && spotifyTokensRep.value.expiresIn)) return [3 /*break*/, 2];
                spotifyApi.setAccessToken(spotifyTokensRep.value.accessToken);
                spotifyApi.setRefreshToken(spotifyTokensRep.value.refreshToken);
                return [4 /*yield*/, refreshToken()];
            case 1:
                _a.sent();
                setRefreshInterval(spotifyTokensRep.value.expiresIn);
                setCallApiInterval();
                _a.label = 2;
            case 2:
                app.get('/nodecg-spotify-widget/spotify_callback', function (req, res) {
                    spotifyStatusRep.value = 'authenticating';
                    var authCode = req.query.code;
                    if (authCode) {
                        spotifyApi.authorizationCodeGrant(authCode)
                            .then(function (data) {
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
                            .catch(function (err) {
                            logger.warn('Failed to authorize to Spotify.');
                            logger.warn(err);
                            logout();
                            res.send('<b>Failed to authorize, Please try again.</b>');
                        });
                    }
                    else {
                        logout();
                        res.send('No code in query, this page only use for spotify auto');
                    }
                });
                nodecg.mount(app);
                return [2 /*return*/];
        }
    });
}); };
