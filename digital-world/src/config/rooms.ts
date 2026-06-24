export type RoomName = 'living_room' | 'kitchen' | 'study' | 'bedroom' | 'bathroom' | 'garden';

export const ROOMS: Record<RoomName, { x: number; y: number; w: number; h: number }> = {
  living_room: { x: 140, y: 160, w: 180, h: 180 },
  kitchen:     { x: 400, y: 160, w: 180, h: 180 },
  study:       { x: 660, y: 160, w: 180, h: 180 },
  bedroom:     { x: 140, y: 420, w: 180, h: 180 },
  bathroom:    { x: 400, y: 420, w: 180, h: 180 },
  garden:      { x: 660, y: 420, w: 180, h: 180 },
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
