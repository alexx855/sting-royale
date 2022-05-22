import { PixiComponent, useApp } from '@inlet/react-pixi';
import { Graphics } from 'pixi.js';
import { forwardRef } from 'react';

import { drawHexGrid } from '~~/functions/drawHexGrid';
import { IHoneycombProps } from '~~/helpers/interfaces';

// TODO: make intrectactive, add pointerdown, pointerup, pointermove
const PixiHoneycombComponent = PixiComponent<IHoneycombProps, Graphics>('Honeycomb', {
  create: (props) => {
    // console.log('create honeycomb grid');
    const graphics = drawHexGrid(new Graphics(), props.honeycomb);
    return graphics;
  },
  applyProps: (graphics, oldProps, props) => {
    // console.log('apply IHoneycombProps', props);

    // clear previous hex
    graphics.clear();

    // TODO: check if honeycomb have changed before updating
    drawHexGrid(graphics, props.honeycomb);
  },
});

// create a component that can be consumed that automatically pass down the app
const PixiHoneycomb = forwardRef((props: any, ref) => <PixiHoneycombComponent ref={ref} app={useApp()} {...props} />);
PixiHoneycomb.displayName = 'PixiHoneycomb';

export default PixiHoneycomb;
