<template>
  <div ref="rootDiv">
    <span class="text-area">
      <span class="mr-4">
        <v-icon
          :size="iconSize"
          class="mr-2"
          color="#ffffff"
        >fas fa-music</v-icon>
      </span>
      <span v-text="spotifyPlayingTrackString"></span>
    </span>
  </div>
</template>

<style scoped>
div {
  height: 100vh;
  color: white;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 5vh 1vw;
  font-size: 50vh;
  font-family: "source-han-sans-japanese";
  text-align: right;
  vertical-align: middle;
  overflow: hidden;
}

</style>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { replicantModule as replicant } from '../plugin/replicant';
@Component
export default class App extends Vue {

  iconSize = 16;

  updated(): void {
    const rootElement = this.$refs.rootDiv as Element;
    this.iconSize = rootElement.clientHeight * 0.5;
  }

  get spotifyPlayingTrackString(): string {
    const playingTrack = replicant.spotifyPlayingTrack;
    if (!playingTrack) {
      return '';
    }
    const artistString = playingTrack.artists.join(',');

    return `${playingTrack.name} / ${artistString}`;
  }
}
</script>