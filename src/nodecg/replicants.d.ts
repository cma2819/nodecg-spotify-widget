import { SpotifyPlayingTrack } from './generated/spotifyPlayingTrack';
import { SpotifyTokens } from "./generated/spotifyTokens";
import { SpotifyStatus } from "./generated/spotifyStatus";
import { SpotifyUserData } from './generated/spotifyUserData';
import { SpotifyPlayingContext } from './generated/spotifyPlayingContext';

type ReplicantMap = {
    spotifyPlayingTrack: SpotifyPlayingTrack,
    spotifyStatus: SpotifyStatus,
    spotifyTokens: SpotifyTokens,
    spotifyUserData: SpotifyUserData,
    spotifyPlayingContext: SpotifyPlayingContext
};

type ReplicantName = (
    'spotifyPlayingTrack' |
    'spotifyStatus' |
    'spotifyTokens' |
    'spotifyUserData' |
    'spotifyPlayingContext'
);

export {
    SpotifyPlayingTrack,
    SpotifyStatus,
    SpotifyTokens,
    SpotifyUserData,
    ReplicantMap,
    ReplicantName
};
