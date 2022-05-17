import { Stage, Sprite, PixiComponent, useApp, useTick } from '@inlet/react-pixi';
import { IEthComponentsSettings } from 'eth-components/models';
import { lazier } from 'eth-hooks/helpers';
import { defineGrid, extendHex, GridFactory, Hex } from 'honeycomb-grid';
import { Viewport } from 'pixi-viewport';
import { Application, Graphics, Point, Text } from 'pixi.js';
import React, { FC, useCallback, useRef, forwardRef, useState } from 'react';
/**
 * ⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️
 * 🏹 See MainPage.tsx for main app component!
 * ⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️
 *
 * This file loads the app async.  It sets up context, error boundaries, styles etc.
 * You don't need to change this file!!
 */

// import postcss style file
import '~~/styles/css/tailwind-base.pcss';
import '~~/styles/css/tailwind-components.pcss';
import '~~/styles/css/tailwind-utilities.pcss';
import '~~/styles/css/app.css';

console.log('init app...');

const BLOCKNATIVE_DAPPID = import.meta.env.VITE_KEY_BLOCKNATIVE_DAPPID;

// load saved theme
const savedTheme = window.localStorage.getItem('theme');

// setup themes for theme switcher
const themes = {
  dark: './dark-theme.css',
  light: './light-theme.css',
};

// create eth components context for options and API keys
const ethComponentsSettings: IEthComponentsSettings = {
  apiKeys: {
    BlocknativeDappId: BLOCKNATIVE_DAPPID,
  },
};

/**
 * Lazy load the main app component
 */
const MainPage = lazier(() => import('./MainPage'), 'MainPage');

/**
 * ### Summary
 * The main app component is {@see MainPage} `components/routes/main/MaingPage.tsx`
 * This component sets up all the providers, Suspense and Error handling
 * @returns
 */

// PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

const width = window.innerWidth;
const height = window.innerHeight;
const hexSize = 250;
const colums = 10;
const rows = 10;

const settings = {
  screenW: width,
  screenH: height,
  hexSize: hexSize,
  hexOrientation: 'flat',
  hexColums: colums, // x
  hexRows: rows, // y
  lineThickness: 5,
  lineColor: 0x999999,
  hideCoords: false,
  hideGrid: true,
  drawMoisture: true,
  gridColor: 0x000000,
  moistureSeed: '0x12345678',
};

const worldWidth = settings.hexColums * settings.hexSize * 1.731 + (settings.hexSize * 1.731) / 2;
const worldHeight = settings.hexRows * settings.hexSize * 1.731 - settings.hexSize / 2;
console.log('worldWidth', worldWidth);
console.log('worldHeight', worldHeight);

const hex = extendHex({ size: settings.hexSize, moisture: 0.5 });
const grid = defineGrid(hex);

// TODO: rm demo areas
const areas = {
  world: [1000, 1000, 2000, 2000],
  center: [1000, 1000, 400, 400],
  tl: [0, 0, 200, 200],
  tr: [1900, 100, 200, 200],
  bl: [100, 1900, 200, 200],
  br: [10000, 10000, 200, 200],
};

const useIteration = (incr = 0.1): number => {
  const [i, setI] = useState(0);

  useTick((delta) => {
    setI((i) => i + incr * delta);
  });

  return i;
};

interface IViewportProps {
  app: Application;
  screenWidth: number;
  screenHeight: number;
  worldWidth: number;
  worldHeight: number;
  plugins?: any[];
  children?: any;
}

// create and instantiate the viewport component
// we share the ticker and interaction from app
const PixiViewportComponent = PixiComponent<IViewportProps, Viewport>('Viewport', {
  create(props) {
    const { app, ...viewportProps } = props;

    const viewport = new Viewport({
      ticker: props.app.ticker,
      interaction: props.app.renderer.plugins.interaction,
      ...viewportProps,
    });

    // const bounceOptions: IBounceOptions = {
    //   friction: 0,
    // };
    // viewport.bounce();

    // https://davidfig.github.io/pixi-viewport/jsdoc/Viewport.html#wheel
    // const wheelOptions: IWheelOptions = {
    //   percent: 0.1,
    //   // reverse: true,  // this could be fine for macos i think
    // };
    // viewport.wheel(wheelOptions);

    // https://davidfig.github.io/pixi-viewport/jsdoc/Viewport.html#wheel
    // const wheelOptions: IWheelOptions = {
    //   percent: 0.001,
    //   // reverse: true,  // this could be fine for macos i think
    // };
    // viewport.wheel(wheelOptions);

    // viewport.snapZoom()

    // activate plugins
    (props.plugins || []).forEach((plugin) => {
      // (viewport.plugins.list[plugin] as any)();
      (viewport as any)[plugin]();
    });

    return viewport;
  },
  applyProps(viewport: any, _oldProps, _newProps) {
    const { plugins: oldPlugins, children: oldChildren, ...oldProps } = _oldProps;
    const { plugins: newPlugins, children: newChildren, ...newProps } = _newProps;

    Object.keys(newProps).forEach((p) => {
      if ((oldProps as any)[p] !== (newProps as any)[p]) {
        viewport[p] = (newProps as any)[p];
      }
    });
  },
  didMount(viewport, parent) {
    console.log('viewport mounted');

    // const worldWidth = settings.hexColums * settings.hexSize * 1.731 + (settings.hexSize * 1.731) / 2;
    // const worldHeight = settings.hexRows * settings.hexSize * 1.731 - settings.hexSize / 2;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // const center = new Point(worldWidth / 2, worldHeight / 2);
    // const center = new Point(0, 0);

    let zoom;
    // Vertical
    if (viewportWidth > viewportHeight) {
      zoom = (viewportWidth * 150) / worldWidth / 100;
    } else {
      // Horizontal
      zoom = (viewportHeight * 150) / worldHeight / 100;
    }

    viewport.setZoom(zoom);

    viewport.on('clicked', (event: any): void => {
      // const { x, y } = event.data.getLocalPosition(event.target);

      // if (typeof x !== 'number' && typeof y !== 'number') {
      //   return;
      // }

      const worldX: number = event.world.x.toFixed(2);
      const worldY: number = event.world.x.toFixed(2);
      console.log({ worldX, worldY });

      viewport.snap(worldX, worldY, { removeOnComplete: true });

      // snapToWorld({ worldX, worldY });

      // console.log(hex);
      // const hexCoordinates = (grid as any).pointToHex(x, y);
      // if (!(hex as any).get(hexCoordinates)) return;
      // console.log(hexCoordinates);
      // get the actual hex from the grid
      // console.log(grid.get(hexCoordinates));
      // let hex = gr.get(hexCoordinates);
      // console.log(hex);
    });
  },
});

// create a component that can be consumed that automatically pass down the app
const PixiViewport = forwardRef((props: any, ref) => <PixiViewportComponent ref={ref} app={useApp()} {...props} />);
PixiViewport.displayName = 'PixiViewport';

// Wiggling bee
interface IBeeProps {
  x?: number;
  y?: number;
  name?: string;
  scale?: number;
  rad?: number;
  rotation?: number;
}
const Bee = forwardRef<any, IBeeProps>((props, ref) => {
  // abstracted away, see settings>js
  const i = useIteration(0.1);
  return (
    <Sprite
      ref={ref}
      image="./assets/4x/Bee_left@4x.png"
      anchor={0.5}
      scale={2}
      rotation={Math.cos(i) * 0.98}
      {...props}
    />
  );
});

Bee.displayName = 'Bee';

const BeeComponent = forwardRef<any, IBeeProps>((props, ref) => {
  const i = useIteration(0.02);

  const x = 2000;
  const y = 2000;
  const rad = 500;

  return <Bee ref={ref} x={x + Math.cos(i) * rad} y={y + Math.sin(i) * rad} scale={3} />;
});

interface IHoneycombProps {
  app: Application;
  grid: GridFactory<Hex<{ size: number; moisture: number }>>;
}

const BIOMES_COLORS = {
  Flat: 0x9a9c2f,
  Desert: 0xf6f2cb,
  Grass: 0x8bba31,
  Forest: 0x00aa26,
  Wather: 0x00a0e9,
  Mountain: 0x9a9c2f,
  Snow: 0xffffff,
  Swamp: 0x00a0e9,
};

// TODO: make intrectactive
const PixiHoneycombComponent = PixiComponent<IHoneycombProps, Graphics>('Honeycomb', {
  create: (props) => {
    console.log('create honeycomb grid');

    const graphics = new Graphics();

    // set the grid line style
    graphics.lineStyle(settings.lineThickness, settings.gridColor);

    // render width x * height y hexes
    grid.rectangle({ width: settings.hexColums, height: settings.hexRows }).forEach((hex) => {
      // TODO: add randomness to biomes with chainlink VRF
      // const coords = hex.cartesian();
      // hex.moisture = moisture[coords.x][coords.y];
      // console.log(coords);

      hex.moisture = Math.floor(Math.random() * Object.keys(BIOMES_COLORS).length);
      let mapColor: number;

      if (settings.drawMoisture) {
        const biome: string = Object.keys(BIOMES_COLORS)[hex.moisture];
        mapColor = (BIOMES_COLORS as any)[biome];

        // else if (hex.moisture < 0.11) {
        //   mapColor = BIOMES_COLORS.Swamp;
        // } else if (hex.moisture < 0.1) {
        //   mapColor = BIOMES_COLORS.Wather;
        // } else if (hex.moisture < 0.6) {
        //   mapColor = BIOMES_COLORS.Grass;
        // } else if (hex.moisture < 0.6) {
        //   mapColor = BIOMES_COLORS.Grass;
        // } else if (hex.moisture < 0.9) {
        //   mapColor = BIOMES_COLORS.Forest;
        // } else if (hex.moisture < 0.9) {
        //   mapColor = BIOMES_COLORS.Mountain;
        // } else if (hex.moisture < 0.9) {
        //   mapColor = BIOMES_COLORS.Snow;
        // }
        // else {
        //   mapColor = BIOMES_COLORS.Flat;
        // }

        graphics.beginFill(mapColor);
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

      if (settings.hideCoords === false) {
        const point = hex.toPoint();
        const centerPosition = hex.center().add(point);
        const coordinates = hex.coordinates();

        const x: string = coordinates.x.toString();
        const y: string = coordinates.y.toString();

        let fontSize = 100;
        if (settings.hexSize < 15) fontSize = settings.hexSize / 1.5;

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

    // return new Graphics();
    return graphics;
  },
  // applyProps: (ins, _, props) => {
  //   console.log('applyProps', props);
  //   // ins.x = props.x;
  //   // ins.y = props.y;
  //   // ins.rotation = props.rotation;
  // },
});

// create a component that can be consumed that automatically pass down the app
const PixiHoneycomb = forwardRef((props: any, ref) => <PixiHoneycombComponent ref={ref} app={useApp()} {...props} />);
PixiHoneycomb.displayName = 'PixiHoneycomb';

const App: FC = () => {
  console.log('loading app...');

  // get the actual viewport instance
  const viewportRef = useRef();
  const honeycombRef = useRef();

  // get ref of the bee to follow
  const beeRef = useRef();

  const [following, setFollowing] = useState(false);

  const follow = (): void => {
    const viewport: any = viewportRef.current;

    // check if viewport is undefined
    if (viewport) {
      // viewport.snapZoom({ width: 1000, height: 1000 });
      viewport.follow(beeRef.current, { speed: 20 });

      // pause following
      if (following) {
        viewport.plugins.pause('follow');
        console.log('pause follow');
        setFollowing(false);
      } else {
        // resume following
        viewport.plugins.resume('follow');
        setFollowing(true);
      }
    }

    console.log('following', following);
  };

  const snapToPoint = useCallback((point: Point | { x: number; y: number }): void => {
    console.log('snapToPoint', point);
    const { x, y } = point;

    const viewport: any = viewportRef.current;

    // check if viewport is undefined
    if (viewport) {
      // viewport.snapZoom({ width: 1000, height: 1000 });

      // pause following
      viewport.plugins.pause('follow');
      setFollowing(false);

      viewport.snap(x, y, { removeOnComplete: true });
      // viewport.snap(x, y, { removeOnComplete: true });
      // console.log('snapToPoint', x * 100, y * 100);
    }
  }, []);

  const snapToWorld = useCallback((coords: { x: number; y: number }): void => {
    const { x, y } = coords;
    const viewport: any = viewportRef.current;

    // check if viewport is undefined
    if (viewport) {
      // pause following
      viewport.plugins.pause('follow');
      setFollowing(false);

      viewport.snap(x, y, { removeOnComplete: true });
    }
  }, []);

  // TODO: prevent re render when not needed
  // const { width, height } = useWindowSize();
  // console.log('width', width, 'height', height);

  const stageProps = {
    height,
    width,
    resolution: window.devicePixelRatio || 1,
    options: {
      antialias: true,
      autoDensity: true,
      backgroundAlpha: 0,
      backgroundColor: 0x10bb99,
    },
  };

  return (
    <>
      <div className="absolute buttons-group">
        {/* <button onClick={(): void => snapToPoint({ x: 5, y: 5 })}>Snap to 5,5</button> */}
        <button onClick={(): void => snapToWorld({ x: 2000, y: 2000 })}>Snap world 2000,2000</button>
        <button onClick={(): void => follow()}>{!following ? 'Follow' : 'Stop Follow'}</button>
        <button
          onClick={(): void => {
            console.log('TODO: die animation');
          }}>
          BEE Die
        </button>
        <button
          onClick={(): void => {
            console.log('TODO: win animation');
          }}>
          BEE Win
        </button>
      </div>

      <Stage {...stageProps}>
        <PixiViewport
          ref={viewportRef}
          plugins={['drag', 'pinch', 'bounce']}
          screenWidth={width}
          screenHeight={height}
          worldWidth={worldWidth}
          worldHeight={worldHeight}>
          <PixiHoneycomb ref={honeycombRef}>
            <BeeComponent ref={beeRef} />
          </PixiHoneycomb>
        </PixiViewport>
      </Stage>
    </>
  );

  // return (
  //   <ErrorBoundary FallbackComponent={ErrorFallback}>
  //     <EthComponentsSettingsContext.Provider value={ethComponentsSettings}>
  //       <ContractsAppContext>
  //         <EthersAppContext>
  //           <ErrorBoundary FallbackComponent={ErrorFallback}>
  //             <ThemeSwitcherProvider themeMap={themes} defaultTheme={savedTheme || 'light'}>
  //               <Suspense fallback={<div />}>
  //                 <MainPage />
  //               </Suspense>
  //             </ThemeSwitcherProvider>
  //           </ErrorBoundary>
  //         </EthersAppContext>
  //       </ContractsAppContext>
  //     </EthComponentsSettingsContext.Provider>
  //   </ErrorBoundary>
  // );
};

export default App;
