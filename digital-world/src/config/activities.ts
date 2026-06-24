import type { HouseRoom } from './rooms';
import type { AnimSequence } from './room-enter-anims';

export interface ActivityDef {
  id:           string;
  label:        string;
  icon:         string;
  rooms:        HouseRoom[];
  selfSceneKey: string;
  partnerAnim:  AnimSequence;
}

export const ACTIVITIES: Record<string, ActivityDef> = {
  magazine_mayhem: {
    id:           'magazine_mayhem',
    label:        'Magazine Mayhem',
    icon:         '📰',
    rooms:        ['living_room'],
    selfSceneKey: 'MagazineMayhemScene',
    partnerAnim:  [
      { anim: 'idle_sitting',     duration: 300 },
      { anim: 'reading_magazine', duration: 0, loop: true },
    ],
  },
};
