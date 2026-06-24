// Central registry: room → background key + prop asset keys.
// Add new props here — PreloadScene picks them up automatically.

export interface RoomAssets {
  bg:    string;
  props: string[];
}

export const ROOM_ASSETS: Record<string, RoomAssets> = {
  bedroom:     { bg: 'rooms/bedroom-bg',     props: ['props/bedroom-bed',          'props/bedroom-dresser'] },
  bathroom:    { bg: 'rooms/bathroom-bg',    props: ['props/bathroom-bathtub',     'props/bathroom-sink'] },
  kitchen:     { bg: 'rooms/kitchen-bg',     props: ['props/kitchen-stove',        'props/kitchen-fridge',   'props/kitchen-table'] },
  living_room: { bg: 'rooms/living-room-bg', props: ['props/living-room-sofa',     'props/living-room-tv',   'props/living-room-table', 'props/living-room-magazine-pile'] },
  garden:      { bg: 'rooms/garden-bg',      props: ['props/garden-door'] },
  study:       { bg: 'rooms/study-bg',       props: ['props/study-desk',           'props/study-bookshelf'] },
  work:        { bg: 'rooms/work-bg',        props: ['props/work-desk'] },
  driving:     { bg: 'rooms/driving-bg',     props: [] },
};

export function getAssetsForRoom(room: string): string[] {
  const r = ROOM_ASSETS[room];
  if (!r) return [];
  return [r.bg, ...r.props];
}

export function assetPath(key: string): string {
  return `assets/${key}.png`;
}
