import { Stage, PixiComponent } from '@inlet/react-pixi';
import { useEthersAppContext } from 'eth-hooks/context';
import { Graphics } from 'pixi.js';
import React, { FC } from 'react';

import { useWindowSize } from './hooks/useWindowSize';

import { IScaffoldAppProviders } from '~~/components/main/hooks/useScaffoldAppProviders';

export interface IMainPageGameProps {
  scaffoldAppProviders: IScaffoldAppProviders;
  children?: React.ReactNode;
}

interface RectangleProps {
  x: number;
  y: number;
  width: number;
  height: number;
  color: number;
}

const Rectangle = PixiComponent<RectangleProps, Graphics>('Rectangle', {
  create: (): any => new Graphics() as any,
  applyProps: (ins, _, props) => {
    ins.x = props.x;
    ins.beginFill(props.color);
    ins.drawRect(props.x, props.y, props.width, props.height);
    ins.endFill();
  },
});

export const Bee = PixiComponent('ComponentName', {
  create: (props) => {
    // instantiate something and return it.
    // for instance:
    return new Graphics();
  },
  didMount: (instance, parent) => {
    // apply custom logic on mount
  },
  willUnmount: (instance, parent) => {
    // clean up before removal
  },
  applyProps: (instance, oldProps, newProps) => {
    // props changed
    // apply logic to the instance
  },
  config: {
    // destroy instance on unmount?
    // default true
    destroy: true,

    // / destroy its children on unmount?
    // default true
    destroyChildren: true,
  },
});

export const MainPageGame: FC<IMainPageGameProps> = (props) => {
  const ethersAppContext = useEthersAppContext();
  const selectedChainId = ethersAppContext.chainId;
  console.log(selectedChainId && selectedChainId !== props.scaffoldAppProviders.targetNetwork.chainId);

  const { width, height } = useWindowSize();

  // Starting from PixiJS 5.0 you can simply use the resizeTo property of your Application:
  // let app = new PIXI.Application({ resizeTo: window });
  const stageProps = {
    height,
    width,
    options: {
      backgroundAlpha: 0,
      antialias: true,
    },
  };

  return (
    <div className="pixi">
      <Stage {...stageProps}>
        <Rectangle x={100} y={100} width={100} height={100} color={0xff0000} />
        <Bee />
      </Stage>
      {/* {props.children} */}
    </div>
  );
};
