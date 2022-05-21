import { Sprite, useTick, Text as TextComponent } from '@inlet/react-pixi';
import { TextStyle } from 'pixi.js';
import { forwardRef, useState } from 'react';

import PixiContainer from './PixiContainer';

import { Hexagon } from '~~/config/game.config';
import { coordFromString } from '~~/functions/coordFromString';
import { trimAddress } from '~~/functions/trimAddress';
import { IBeeProps } from '~~/helpers/interfaces';

const useIteration = (incr = 0.1): number => {
  const [i, setI] = useState(0);

  useTick((delta) => {
    setI((i) => i + incr * delta);
  });

  return i;
};

const Bee = forwardRef<any, IBeeProps>((props, ref) => {
  // abstracted away, see settings>js
  const i = useIteration(0.1);

  // const container = new Container();
  // container.filters = [new OutlineFilter()];
  const player = props.players[props.address];
  const selected = ref ? true : false;
  const displayAddress = trimAddress(props.address);
  // TODO: load bee color from NFT
  const beeColor = '#E5D900';

  const { points, coords } = player;
  const isDead = points > 0;
  const rotation = isDead ? Math.cos(i) * 0.98 : 260;

  // scale is proporcional to points, clamp to 1 min, max 5
  const scale = Math.max(3, Math.min(1, points / 100));

  const hex = Hexagon.get(coordFromString(coords as string));
  const point = hex?.toPoint();
  const centerPosition = hex?.center().add(point);

  const image = isDead ? './assets/4x/Bee_left@4x.png' : './assets/4x/Bee_dead@4x.png';

  // center container to hex
  // TODO: slightly offset of hex center using the prev coords as reference
  const containerCoords = {
    x: centerPosition?.x || 0,
    y: centerPosition?.y || 0,
  };

  const addressTextCoords = {
    x: 0,
    y: 150,
  };

  const pointsTextCoords = {
    x: 0,
    y: -100,
  };

  // TODO: add % is !isDead to fit size better

  return (
    <PixiContainer x={containerCoords.x} y={containerCoords.y} {...props}>
      {/* <GraphicsComponent x={0} y={0} draw={draw} /> */}
      {/* TODO: add identicon and usernames */}
      <TextComponent
        text={displayAddress}
        anchor={0.5}
        x={addressTextCoords.x}
        y={addressTextCoords.y}
        style={
          new TextStyle({
            align: 'center',
            // fontFamily: '"Source Sans Pro", Helvetica, sans-serif',
            fontSize: 18 * scale,
            fontWeight: 'normal',
            fill: ['#ffffff', selected ? beeColor : '#ffffff'], // gradient
            stroke: '#000',
            strokeThickness: 3,
            // letterSpacing: 5,
            // dropShadow: true,
            // dropShadowColor: '#ccced2',
            // dropShadowBlur: 4,
            // dropShadowAngle: Math.PI / 6,
            // dropShadowDistance: 6,
            wordWrap: false,
            // wordWrapWidth: 440,
          })
        }
      />

      {isDead && (
        <TextComponent
          text={points.toString()}
          anchor={0.5}
          x={pointsTextCoords.x}
          y={pointsTextCoords.y}
          style={
            new TextStyle({
              align: 'center',
              // fontFamily: '"Source Sans Pro", Helvetica, sans-serif',
              fontSize: 20 * scale,
              fontWeight: 'normal',
              fill: ['#ffffff', selected ? beeColor : '#ffffff'], // gradient
              stroke: '#000',
              strokeThickness: 5,
              letterSpacing: 5,
              // dropShadow: true,
              // dropShadowColor: '#ccced2',
              // dropShadowBlur: 4,
              // dropShadowAngle: Math.PI / 6,
              // dropShadowDistance: 6,
              wordWrap: false,
              // wordWrapWidth: 440,
            })
          }
        />
      )}

      <Sprite ref={ref} anchor={0.5} scale={scale} y={40} image={image} rotation={rotation} />
    </PixiContainer>
  );
});

Bee.displayName = 'Bee';

const BeeComponent = forwardRef<any, IBeeProps>((props, ref) => {
  // console.log('BeeComponent');
  return <Bee ref={ref} {...props} />;
});

export default BeeComponent;
