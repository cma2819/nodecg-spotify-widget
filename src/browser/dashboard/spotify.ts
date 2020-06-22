import { Module, getModule, VuexModule, Action } from 'vuex-module-decorators';
import store from '../plugin/store';

@Module({ dynamic: true, store, name: 'socialLogin', namespaced: true })
class Spotify extends VuexModule {
    clientId = nodecg.bundleConfig.spotify?.clientId;
    redirectUri = nodecg.bundleConfig.spotify?.redirectUri;

    @Action
    logout(): void {
        nodecg.sendMessage('spotify:logout');
    }
}

export const spotifyModule = getModule(Spotify);