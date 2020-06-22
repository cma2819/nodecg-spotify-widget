import { VuexModule, getModule, Module, Mutation } from 'vuex-module-decorators';
import store from './store';
import { ReplicantName, SpotifyPlayingTrack, SpotifyStatus, SpotifyTokens, SpotifyUserData } from '../../nodecg/replicants';
import clone from 'clone';

@Module({ dynamic: true, store, name: 'replicant', namespaced: true })
class Replicant extends VuexModule {
    spotifyPlayingTrack: SpotifyPlayingTrack = null;
    spotifyStatus: SpotifyStatus = 'unauthorized';
    spotifyTokens: SpotifyTokens = {};
    spotifyUserData: SpotifyUserData = {};

    @Mutation
    public updateSpotifyPlayingTrack(value: SpotifyPlayingTrack): void {
        this.spotifyPlayingTrack = value;
    }
    @Mutation
    public updateSpotifyStatus(value: SpotifyStatus): void {
        this.spotifyStatus = value;
    }
    @Mutation
    public updateSpotifyTokens(value: SpotifyTokens): void {
        this.spotifyTokens = value;
    }
    @Mutation
    public updateSpotifyUserData(value: SpotifyUserData): void {
        this.spotifyUserData = value;
    }
}

export const replicantModule = getModule(Replicant);

const replicantMutations: [ReplicantName, Function][] = [
    ['spotifyPlayingTrack', replicantModule.updateSpotifyPlayingTrack],
    ['spotifyStatus', replicantModule.updateSpotifyStatus],
    ['spotifyTokens', replicantModule.updateSpotifyTokens],
    ['spotifyUserData', replicantModule.updateSpotifyUserData],
];

replicantMutations.forEach(([name, mutator]) => {
    const replicant = nodecg.Replicant(name);

    replicant.on('change', (newVal) => {
        mutator(clone(newVal));
    });
});
