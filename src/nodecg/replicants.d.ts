import { SpotifyPlayingTrack } from './generated/spotifyPlayingTrack';
import { SpotifyTokens } from "./generated/spotifyTokens";
import { SpotifyStatus } from "./generated/spotifyStatus";
import { SpotifyUserData } from './generated/spotifyUserData';

type ReplicantMap = {
    spotifyPlayingTrack: SpotifyPlayingTrack,
    spotifyStatus: SpotifyStatus,
    spotifyTokens: SpotifyTokens,
    spotifyUserData: SpotifyUserData,
};

type ReplicantName = (
    'spotifyPlayingTrack' |
    'spotifyStatus' |
    'spotifyTokens' |
    'spotifyUserData'
);

export {
    SpotifyPlayingTrack,
    SpotifyStatus,
    SpotifyTokens,
    SpotifyUserData,
    ReplicantMap,
    ReplicantName
};
