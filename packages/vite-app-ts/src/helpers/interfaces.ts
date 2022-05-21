// import { Hex } from "honeycomb-grid";
import { Application } from 'pixi.js';

export interface IPlayerState {
  status: null | 'idle' | 'moving' | 'dead';
  coords: string | null; // honecomb coordinates ref
  points: number;
  movingTo?: string | null;
}
export interface IHoneyComb {
  // honecomb coordinates as key
  [key: string]: {
    addresses: string[]; // player address ref to IGameState.players
    redward: boolean; // vrf spawn, gives the bee a redward
    cursed: boolean; // instantly kill bees
  };
}
export interface IGameState {
  status: 'loading' | 'loaded' | 'queuing' | 'ready' | 'playing' | 'finished' | 'error';
  players: {
    // player address as key
    [key: string]: IPlayerState;
  };
  honeycomb: IHoneyComb;
  address: string | null;
  block: number;
  prevGameResults?: string | null;
}

export interface IHoneycombProps {
  honeycomb: IHoneyComb;
  app: Application;
  //   onCreate?: (hex: Hex<{ size: number; moisture: number }>) => void;
}

export interface IBeeProps {
  players: { [key: string]: IPlayerState };
  address: string;
  // points: number;
  // coords: [number, number];
  // animate?: boolean;
  // scale?: number;
  // rad?: number;
  // rotation?: number;
  // x?: number;
  // y?: number;
  // name?: string;
}

// export interface IBeeContainerProps {
//   x?: number;
//   y?: number;
// }

export interface IViewportProps {
  app: Application;
  screenWidth: number;
  screenHeight: number;
  worldWidth: number;
  worldHeight: number;
  plugins?: any[];
  children?: any;
  didMount?: any;
  onClick?: any;
  gameState?: any;
  currentAddress?: any;
}
