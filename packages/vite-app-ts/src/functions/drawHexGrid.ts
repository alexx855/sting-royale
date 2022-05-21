import { Graphics, Text } from 'pixi.js';

import { coordFromString } from './coordFromString';

import { Hexagon, SETTINGS } from '~~/config/game.config';
import { IHoneyComb } from '~~/helpers/interfaces';

export function drawHexGrid(graphics: Graphics, honeycomb: IHoneyComb): Graphics {
  // set the grid line style
  graphics.lineStyle(SETTINGS.lineThickness, SETTINGS.gridColor);

  // render width x * height y hexes
  Object.keys(honeycomb).forEach((coord) => {
    // Grid.rectangle({ width: SETTINGS.hexColums, height: SETTINGS.hexRows }).forEach((hex) => {

    const hex = Hexagon.get(coordFromString(coord));
    if (!hex) {
      return;
    }

    if (SETTINGS.fillHexagons) {
      // default color
      const { cursed, redward, addresses } = honeycomb[coord];
      let fillColor = 0xf6f2cb;
      if (cursed) {
        fillColor = 0x8c0707;
      } else if (redward) {
        fillColor = 0xc88c00;
      }

      // TODO: highlight player posible moves
      // else if( addresses.length > 0 && addresses[playerAddress] ) {

      graphics.beginFill(fillColor);
    }

    const point = hex.toPoint();
    // add the hex's position to each of its corner points
    const corners = hex.corners().map((corner) => corner.add(point));
    // separate the first from the other corners
    const [firstCorner, ...otherCorners] = corners;

    // move the "pen" to the first corner
    graphics.moveTo(firstCorner.x, firstCorner.y);
    // draw lines to the other corners
    otherCorners.forEach(({ x, y }) => graphics.lineTo(x, y));
    // finish at the first corner
    graphics.lineTo(firstCorner.x, firstCorner.y);

    if (SETTINGS.hideCoords === false) {
      // const point = hex.toPoint();
      const centerPosition = hex.center().add(hex.toPoint());
      const coordinates = hex.coordinates();

      const x: string = coordinates.x.toString();
      const y: string = coordinates.y.toString();

      let fontSize = 100;
      if (SETTINGS.hexSize < 15) fontSize = SETTINGS.hexSize / 1.5;

      const text = new Text(x + ',' + y, {
        fontFamily: 'Arial',
        fontSize: fontSize,
        fill: 0x000000,
        align: 'center',
      });

      text.x = centerPosition.x;
      text.y = centerPosition.y;
      text.anchor.set(0.5);

      graphics.addChild(text);
    }

    // props.app.stage.addChild(graphics);
  });

  return graphics;
}
