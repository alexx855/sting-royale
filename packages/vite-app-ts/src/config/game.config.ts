import { defineGrid, extendHex } from 'honeycomb-grid';

import { IGameState, IPlayerState } from '~~/helpers/interfaces';

export const INIT_GAME_STATE: IGameState = {
  status: 'loading',
  address: null, // contract address
  honeycomb: {},
  players: {},
  block: 0,
};

export const DEMO_ADDRESS = [
  '0x94ca0F69A3E9dDffe090E59Bac5186ddE97B5820',
  '0xFFdeFcab295a19e402987B8cb7E55f3987E0321f',
  '0x04431191382AfFE9C5c86F5bB7636297541CC3DD',
  '0xc9a308A266dE5b3276b41B8E8B1f52a2E4B67c76',
  '0x9dd5CA189bC98e2cF4F99179BF7F003305640414',
  '0x9d8720629D646a7453B461631c4b3702FaeafDF4',
];

export const SETTINGS = {
  screenW: window.innerWidth,
  screenH: window.innerHeight,
  hexSize: 250,
  hexOrientation: 'flat',
  hexColums: 2, // x rectangle grid only
  hexRows: 2, // y rectangle grid only
  radius: 4,
  lineThickness: 4,
  lineColor: 0x999999,
  hideCoords: false,
  hideGrid: true,
  fillHexagons: true,
  gridColor: 0x000000,
  initialPoints: 100,
  maxPlayers: 6,
};

// initial coords point on the honeycomb grid
export const SPAWN_POINTS: [number, number][] = [
  [-SETTINGS.radius, 0],
  [SETTINGS.radius, 0],
  [-(SETTINGS.radius / 2), SETTINGS.radius],
  [SETTINGS.radius / 2, SETTINGS.radius],
  [-(SETTINGS.radius / 2), -SETTINGS.radius],
  [SETTINGS.radius / 2, -SETTINGS.radius],
];

export const INIT_PLAYER_STATE: IPlayerState = {
  status: null,
  coords: null,
  points: 0,
};

export const hextendHex = extendHex({ size: SETTINGS.hexSize, redward: false, cursed: false });
export const Grid = defineGrid(hextendHex);
export const Hexagon = Grid.spiral({ radius: SETTINGS.radius, center: [0, 0] });
