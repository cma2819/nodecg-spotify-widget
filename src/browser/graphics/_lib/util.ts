import { Social } from '../components/Nameplate/types';

export const secondsToFormatted = (base: number): string => {
    const seconds = base % 60;
    const minutes = Math.floor(base / 60) % 60;
    const hours = Math.floor(base / 3600);

    return `${hours ? hours + ':' : ''}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export const existsSocialIn = (social: Social): number[] => {
    const TWITCH = 0;
    const NICO = 1;
    const YOUTUBE = 2;
    const TWITTER = 3;

    const exists = [];
    social.twitch ? exists.push(TWITCH) : null;
    social.nico ? exists.push(NICO) : null;
    social.youtube ? exists.push(YOUTUBE) : null;
    social.twitter ? exists.push(TWITTER) : null;

    return exists;
}