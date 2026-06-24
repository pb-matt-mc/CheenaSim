import type { HouseRoom } from './rooms';
import { ROOMS } from './rooms';

export interface AnimStep {
  anim:     string;
  duration: number;
  moveTo?:  { x: number; y: number };
  loop?:    boolean;
}

export type AnimSequence = AnimStep[];

const pos = (room: HouseRoom) => ({ x: ROOMS[room].x, y: ROOMS[room].y });

export const ROOM_ENTER_ANIMS: Record<HouseRoom, AnimSequence> = {
  living_room: [
    { anim: 'walk',         duration: 800, moveTo: pos('living_room') },
    { anim: 'sit_couch',    duration: 700 },
    { anim: 'idle_sitting', duration: 0, loop: true },
  ],
  bedroom: [
    { anim: 'walk', duration: 800, moveTo: pos('bedroom') },
    { anim: 'idle', duration: 0,   loop: true },
  ],
  bathroom: [
    { anim: 'walk', duration: 600, moveTo: pos('bathroom') },
    { anim: 'idle', duration: 0,   loop: true },
  ],
  kitchen: [
    { anim: 'walk', duration: 800, moveTo: pos('kitchen') },
    { anim: 'idle', duration: 0,   loop: true },
  ],
  study: [
    { anim: 'walk',         duration: 800, moveTo: pos('study') },
    { anim: 'sit_desk',     duration: 700 },
    { anim: 'idle_sitting', duration: 0, loop: true },
  ],
  garden: [
    { anim: 'walk', duration: 800, moveTo: pos('garden') },
    { anim: 'idle', duration: 0,   loop: true },
  ],
};

export const WORK_DRIVING_ANIM: AnimSequence = [
  { anim: 'walk',    duration: 600, moveTo: pos('garden') },
  { anim: 'driving', duration: 0,   loop: true },
];
