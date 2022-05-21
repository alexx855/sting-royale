import { Hex } from 'honeycomb-grid';

import { coordToString } from './coordToString';

import { Hexagon } from '~~/config/game.config';
import { IHoneyComb } from '~~/helpers/interfaces';

export function createHoneycomb(): IHoneyComb {
  const honeycomb: IHoneyComb = {};
  Hexagon.forEach(
    (
      hex: Hex<{
        size: number;
      }>
    ) => {
      honeycomb[coordToString([hex.x, hex.y])] = {
        addresses: [],
        redward: false,
        cursed: false,
      };
    }
  );

  return honeycomb;
}
