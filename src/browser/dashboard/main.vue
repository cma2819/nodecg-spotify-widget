<template>
  <v-app>
    <div class="mb-2">
      Login to social service.
    </div>
    <v-btn
      v-if="canSpotifyLogin"
      :disabled="!canSpotifyLogin"
      block
      class="mb-2"
      :href="`https://accounts.spotify.com/authorize?response_type=code&client_id=${spotify.clientId}&redirect_uri=${spotify.redirectUri}&scope=${spotifyScope}`"
      target="_blank"
      :color="colors.spotify.primary"
    >
      <v-icon class="mr-2">
        fab fa-spotify
      </v-icon>
      Spotify Login
    </v-btn>
    <v-btn
      v-if="canSpotifyLogout"
      :disabled="!canSpotifyLogout"
      block
      class="mb-2"
      dark
      @click="logoutFromSpotify"
    >
      <v-icon class="mr-2">
        fab fa-spotify
      </v-icon>
      Logout from "{{ spotifyUser }}"
    </v-btn>
    <v-sheet
      v-if="isSpotifyAuthorized"
      class="ma-2"
      :color="colors.spotify.primary"
    >
      <v-container>
        <v-row
          align="center"
        >
          <v-col :cols="2">
            <v-icon>
              fas fa-play
            </v-icon>
          </v-col>
          <v-col :cols="10">
            <div>{{ playingTrackName }}</div>
            <div class="ml-2">
              {{ playingTrackArtists }}
            </div>
            <div class="ml-2">
              {{ playingTrackAlbumName }}
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-sheet>
  </v-app>
</template>

<script lang="ts">
import { Vue, Component, Emit } from 'vue-property-decorator';
import { spotifyModule as spotify } from './spotify';
import { replicantModule as replicant } from '../plugin/replicant';
import { COLORS } from '../plugin/styles';

@Component
export default class App extends Vue {
  colors = COLORS;

  get spotifyScope(): string {
    return 'user-read-private%20user-read-currently-playing%20user-read-playback-state'
  }

  get spotifyUser(): string {
    return replicant.spotifyUserData.name || '';
  }

  get playingTrackName(): string {
    if (replicant.spotifyPlayingTrack) {
      return replicant.spotifyPlayingTrack.name;
    }
    return '';
  }

  get playingTrackArtists(): string {
    if (replicant.spotifyPlayingTrack) {
      return replicant.spotifyPlayingTrack.artists.join('/');
    }
    return '';
  }

  get playingTrackAlbumName(): string {
    if (replicant.spotifyPlayingTrack) {
      return replicant.spotifyPlayingTrack.albumName;
    }
    return '';
  }

  get spotify(): {clientId?: string; redirectUri?: string} {
    return {
      clientId: spotify.clientId,
      redirectUri: spotify.redirectUri
    };
  }

  get isSpotifyAuthorized(): boolean {
    return replicant.spotifyStatus === 'authorized';
  }

  get canSpotifyLogin(): boolean {
    if (!spotify.clientId || !spotify.redirectUri) {
      return false;
    }
    if (replicant.spotifyStatus === 'authenticating' || replicant.spotifyStatus === 'authorized') {
      return false;
    }
    return true;
  }

  get canSpotifyLogout(): boolean {
    if (replicant.spotifyStatus === 'authorized') {
      return true;
    }
    return false;
  }
  
  @Emit()
  logoutFromSpotify(): void {
    spotify.logout();
  }
}
</script>
