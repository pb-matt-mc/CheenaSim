export type HouseRoom = 'living_room' | 'kitchen' | 'study' | 'bedroom' | 'bathroom' | 'garden';
export type RoomName = HouseRoom; // backwards-compat alias
export type LocationName = HouseRoom | 'work';

export interface RoomData {
  x: number; y: number; w: number; h: number;
  bgKey: string;
  /** Non-overlapping standing positions in the house overview */
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  /** Corridor waypoint for doorway navigation in house view (y ≈ 292) */
  door: { x: number; y: number };
  /** Positions in the full 960×640 RoomScene */
  sceneEntry: { x: number; y: number };
  sceneP1:    { x: number; y: number };
  sceneP2:    { x: number; y: number };
}

export const ROOMS: Record<RoomName, RoomData> = {
  bedroom: {
    x: 225, y: 200, w: 175, h: 155, bgKey: 'rooms/bedroom-bg',
    p1: { x: 210, y: 200 }, p2: { x: 244, y: 188 },
    door: { x: 225, y: 292 },
    sceneEntry: { x: 480, y: 590 }, sceneP1: { x: 340, y: 400 }, sceneP2: { x: 580, y: 370 },
  },
  bathroom: {
    x: 460, y: 195, w: 175, h: 155, bgKey: 'rooms/bathroom-bg',
    p1: { x: 445, y: 195 }, p2: { x: 477, y: 183 },
    door: { x: 460, y: 292 },
    sceneEntry: { x: 480, y: 590 }, sceneP1: { x: 300, y: 380 }, sceneP2: { x: 650, y: 300 },
  },
  kitchen: {
    x: 695, y: 200, w: 175, h: 155, bgKey: 'rooms/kitchen-bg',
    p1: { x: 680, y: 200 }, p2: { x: 712, y: 188 },
    door: { x: 695, y: 292 },
    sceneEntry: { x: 480, y: 590 }, sceneP1: { x: 460, y: 460 }, sceneP2: { x: 580, y: 460 },
  },
  living_room: {
    x: 225, y: 375, w: 175, h: 135, bgKey: 'rooms/living-room-bg',
    p1: { x: 205, y: 375 }, p2: { x: 248, y: 362 },
    door: { x: 225, y: 292 },
    sceneEntry: { x: 100, y: 380 }, sceneP1: { x: 340, y: 470 }, sceneP2: { x: 530, y: 470 },
  },
  garden: {
    x: 460, y: 375, w: 175, h: 135, bgKey: 'rooms/garden-bg',
    p1: { x: 445, y: 375 }, p2: { x: 478, y: 362 },
    door: { x: 460, y: 292 },
    sceneEntry: { x: 480, y: 60 }, sceneP1: { x: 360, y: 370 }, sceneP2: { x: 590, y: 370 },
  },
  study: {
    x: 695, y: 375, w: 175, h: 135, bgKey: 'rooms/study-bg',
    p1: { x: 675, y: 375 }, p2: { x: 718, y: 362 },
    door: { x: 695, y: 292 },
    sceneEntry: { x: 100, y: 380 }, sceneP1: { x: 400, y: 400 }, sceneP2: { x: 620, y: 250 },
  },
};

export const ROOM_NAMES = Object.keys(ROOMS) as RoomName[];

export function roomAtPointer(px: number, py: number): RoomName | null {
  for (const [name, r] of Object.entries(ROOMS) as [RoomName, RoomData][]) {
    const hw = r.w / 2, hh = r.h / 2;
    if (px >= r.x - hw && px <= r.x + hw && py >= r.y - hh && py <= r.y + hh) {
      return name;
    }
  }
  return null;
}
