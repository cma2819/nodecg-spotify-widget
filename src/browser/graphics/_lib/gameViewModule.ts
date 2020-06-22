import { VuexModule, Module, getModule, Mutation, Action } from 'vuex-module-decorators';
import store from '../../plugin/store';
import { replicantModule as replicant } from '../../plugin/replicant';
import { speedcontrolModule as speedcontrol } from '../../plugin/speedcontrol';
import { Social } from '../components/Nameplate/types';
import { existsSocialIn, secondsToFormatted } from './util';

@Module({ dynamic: true, store, name: 'gameViewModule', namespaced: true })
class GameViewModule extends VuexModule {
    displaySocialIndex = 0;

    get runData(): {
        game: string;
        category: string;
        platform: string;
        estimate: string;
    } {
        const currentRun = speedcontrol.runDataArray[
            replicant.speedcontrolCurrentRunIndex
        ];
        return {
            game: currentRun?.game || '',
            category: currentRun?.category || '',
            platform: currentRun?.system || '',
            estimate: currentRun?.estimate || ''
        };
    }

    get commentator(): {
        name: string;
        social: Social;
    } {
        const name: string[] = [];
        const twitch: string[] = [];
        const nico: string[] = [];
        const youtube: string[] = [];
        const twitter: string[] = [];
        const currentRun = speedcontrol.runDataArray[
            replicant.speedcontrolCurrentRunIndex
        ];
        if (!currentRun) {
            return {
                name: '',
                social: {}
            }
        }
        replicant.commentatorArray.filter((commentator) => {
            return commentator.assignedRunIdArray.some(runId => runId === currentRun.id);
        }).forEach((commentator) => {
            name.push(commentator.name);
            commentator.social.twitch ? twitch.push(commentator.social.twitch) : null;
            commentator.social.nico ? nico.push(commentator.social.nico) : null;
            commentator.social.youtube ? youtube.push(commentator.social.youtube) : null;
            commentator.social.twitter ? twitter.push(commentator.social.twitter) : null;
        });

        return {
            name: name.join(' / '),
            social: {
                twitch: twitch ? twitch.join(' / ') : undefined,
                nico: nico ? nico.join(' / ') : undefined,
                youtube: youtube ? youtube.join(' / ') : undefined,
                twitter: twitter ? twitter.join(' / ') : undefined
            }
        }
    }

    get runners(): {
        name: string;
        social: Social;
        status: 'forfeit' | 'completed' | 'running';
        time: string;
    }[] {
        const currentRun = speedcontrol.runDataArray[
            replicant.speedcontrolCurrentRunIndex
        ];
        const teamFinishTimes = speedcontrol?.timer?.teamFinishTimes;
        if (!currentRun || !teamFinishTimes) {
            return [];
        }
        return currentRun.teams.map((team) => {
            const runner = team.players[0];
            if (!runner) {
                return {
                    name: '',
                    social: {},
                    status: 'running',
                    time: ''
                }
            }
            const runnerAddition = replicant.speedcontrolUserAdditionArray.find((userAddition) => {
                return userAddition.id === runner.id;
            });

            const finishTime = teamFinishTimes[team.id];
    
            return {
                name: runner.name,
                social: {
                    twitch: runner.social.twitch,
                    nico: runnerAddition?.social.nico,
                    youtube: runnerAddition?.social.youtube,
                    twitter: runnerAddition?.social.twitter
                },
                status: finishTime ? finishTime.state : 'running',
                time: finishTime ? secondsToFormatted(Math.floor(finishTime.milliseconds / 1000)) : ''
            };
        });
    }

    get existsSocials(): number[] {
        const existsAll: number[][] = [];
        this.runners.forEach((runner) => {
            existsAll.push(existsSocialIn(runner.social));
        })
        existsAll.push(existsSocialIn(this.commentator.social));

        return existsAll.flat().filter((socialIndex, index, self) => {
            return self.indexOf(socialIndex) === index;
        }).sort();
    }

    get currentSocial(): number {
        return this.existsSocials[this.displaySocialIndex];
    }

    get currentTime(): {
        ms: number;
        time: string;
    } {
        return {
            ms: speedcontrol.timer.milliseconds || 0,
            time: speedcontrol.timer.milliseconds ? secondsToFormatted(Math.floor(speedcontrol.timer.milliseconds / 1000)) : '00:00'
        };
    }

    get runStatus(): ('stopped' | 'running' | 'paused' | 'finished') {
        return speedcontrol.timer.state || 'stopped'
    }

    @Mutation
    _nextSocial(exists: number[]): void {
        this.displaySocialIndex = (this.displaySocialIndex + 1) % exists.length;
    }
    
    @Action
    nextSocial(): void {
        this._nextSocial(this.existsSocials);
    }
}

export const gameViewModule = getModule(GameViewModule);