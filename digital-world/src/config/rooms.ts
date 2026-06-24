export type RoomName = 'living_room' | 'kitchen' | 'study' | 'bedroom' | 'bathroom' | 'garden';

// (x,y) = sim standing position + click-zone center; (w,h) = click-zone size.
// Calibrated against the 960×640 house.png pixel-art background.
export const ROOMS: Record<RoomName, { x: number; y: number; w: number; h: number }> = {
  bedroom:     { x: 225, y: 200, w: 175, h: 155 }, // top-left  — purple rug
  bathroom:    { x: 460, y: 195, w: 175, h: 155 }, // top-center — teal tiles
  kitchen:     { x: 695, y: 200, w: 175, h: 155 }, // top-right  — warm dining
  living_room: { x: 225, y: 375, w: 175, h: 135 }, // bot-left   — red sofa
  garden:      { x: 460, y: 375, w: 175, h: 135 }, // bot-center — hallway/entry
  study:       { x: 695, y: 375, w: 175, h: 135 }, // bot-right  — blue desk
};

export const ROOM_NAMES = Object.keys(ROOMS) as RoomName[];

export function roomAtPointer(px: number, py: number): RoomName | null {
  for (const [name, r] of Object.entries(ROOMS) as [RoomName, typeof ROOMS[RoomName]][]) {
    const hw = r.w / 2, hh = r.h / 2;
    if (px >= r.x - hw && px <= r.x + hw && py >= r.y - hh && py <= r.y + hh) {
      return name;
    }
  }
  return null;
}
