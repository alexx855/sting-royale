import { PixiComponent, useApp } from '@inlet/react-pixi';
import { Viewport } from 'pixi-viewport';
import { forwardRef } from 'react';

import { IViewportProps } from '~~/helpers/interfaces';

// we share the ticker and interaction from app
const PixiViewportComponent = PixiComponent<IViewportProps, Viewport>('Viewport', {
  create(props) {
    const { app, ...viewportProps } = props;

    const viewport = new Viewport({
      ticker: props.app.ticker,
      interaction: props.app.renderer.plugins.interaction,
      ...viewportProps,
    });

    // activate plugins decalred in the viewport props.plugins
    (props.plugins || []).forEach((plugin) => {
      (viewport as any)[plugin]();
    });

    return viewport;
  },
  applyProps(viewport: any, _oldProps, _newProps) {
    const { plugins: oldPlugins, children: oldChildren, ...oldProps } = _oldProps;
    const { plugins: newPlugins, children: newChildren, ...newProps } = _newProps;

    // apply new props ???
    Object.keys(newProps).forEach((p) => {
      if ((oldProps as any)[p] !== (newProps as any)[p]) {
        viewport[p] = (newProps as any)[p];
      }
    });
  },
});

// create a component that can be consumed that automatically pass down the app
const PixiViewport = forwardRef((props: any, ref) => {
  return <PixiViewportComponent ref={ref} app={useApp()} {...props} />;
});

PixiViewport.displayName = 'PixiViewport';

export default PixiViewport;
