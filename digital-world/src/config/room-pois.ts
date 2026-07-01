import type { HouseRoom } from './rooms';

export interface PoiDef {
  x: number;          // position in 960×640 RoomScene coords
  y: number;
  activityId: string;
  cardTitle: string;
  cardIcon: string;
  cardColor: number;  // 0xRRGGBB
}

export const ROOM_POIS: Partial<Record<HouseRoom, PoiDef[]>> = {
  living_room: [
    {
      x: 480, y: 450,
      activityId: 'magazine_mayhem',
      cardTitle: 'Magazine Mayhem',
      cardIcon: '📰',
      cardColor: 0xF5B547,
    },
  ],
  kitchen: [
    {
      x: 720, y: 320,
      activityId: 'fridge_board',
      cardTitle: 'Fridge Board',
      cardIcon: '🧲',
      cardColor: 0x48BB78,
    },
  ],
};
