/* eslint-disable unused-imports/no-unused-vars-ts */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Stage, Sprite, PixiComponent, useApp, useTick, Container, Text as TextComponent } from '@inlet/react-pixi';
import { IEthComponentsSettings } from 'eth-components/models';
import { lazier } from 'eth-hooks/helpers';
import { defineGrid, extendHex, Hex } from 'honeycomb-grid';
import { Viewport } from 'pixi-viewport';
import { Application, Graphics, TextStyle, Text } from 'pixi.js';
import React, { FC, useRef, forwardRef, useState, useEffect, useCallback } from 'react';

import { useWindowSize } from './components/main/hooks/useWindowSize';

// import postcss style file
import '~~/styles/css/tailwind-base.pcss';
import '~~/styles/css/tailwind-components.pcss';
import '~~/styles/css/tailwind-utilities.pcss';
import '~~/styles/css/app.css';

const SETTINGS = {
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
const SPAWN_POINTS: [number, number][] = [
  [-SETTINGS.radius, 0],
  [SETTINGS.radius, 0],
  [-(SETTINGS.radius / 2), SETTINGS.radius],
  [SETTINGS.radius / 2, SETTINGS.radius],
  [-(SETTINGS.radius / 2), -SETTINGS.radius],
  [SETTINGS.radius / 2, -SETTINGS.radius],
];

// ultis
const coordToString = ([x, y]: [number, number]): string => `${x},${y}`;
const coordFromString = (str: string): [number, number] => {
  const [x, y] = str.split(',');
  return [+x, +y];
};
const trimAddress = (address: string): string => {
  return '0x...' + address.substring(address.length - 3, address.length);
};

interface IPlayerState {
  status: null | 'idle' | 'moving' | 'dead';
  coords: string | null; // honecomb coordinates ref
  points: number;
  movingTo?: string | null;
}
interface IHoneyComb {
  // honecomb coordinates as key
  [key: string]: {
    addresses: string[]; // player address ref to IGameState.players
    redward: boolean; // vrf spawn, gives the bee a redward
    cursed: boolean; // instantly kill bees
  };
}
interface IGameState {
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

const hextendHex = extendHex({ size: SETTINGS.hexSize, redward: false, cursed: false });
const Grid = defineGrid(hextendHex);
// TODO: handle on create event ???
const Hexagon = Grid.spiral({ radius: SETTINGS.radius, center: [0, 0] });

// TODO: add test, this should be equal the to the first spawn hex
// console.log(SPAWN_POINTS[0][0] === Object.values(Hexagon)[0].x, SPAWN_POINTS[0][1] === Object.values(Hexagon)[0].y);

const INIT_PLAYER_STATE: IPlayerState = {
  status: null,
  coords: null,
  points: 0,
};

// create honeycomb from hexagon
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

const INIT_GAME_STATE: IGameState = {
  status: 'loading',
  address: null, // contract address
  honeycomb: honeycomb,
  players: {},
  block: 0,
};

const DEMO_ADDRESS = [
  '0x94ca0F69A3E9dDffe090E59Bac5186ddE97B5820',
  '0xFFdeFcab295a19e402987B8cb7E55f3987E0321f',
  '0x04431191382AfFE9C5c86F5bB7636297541CC3DD',
  '0xc9a308A266dE5b3276b41B8E8B1f52a2E4B67c76',
  '0x9dd5CA189bC98e2cF4F99179BF7F003305640414',
  '0x9d8720629D646a7453B461631c4b3702FaeafDF4',
];

const PixiContainer: any = (props: any) => {
  return <Container {...props} />;
};

interface IHoneycombProps {
  honeycomb: IHoneyComb;
  app?: Application;
  onCreate?: (hex: Hex<{ size: number; moisture: number }>) => void;
}

interface IBeeProps {
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
// interface IBeeContainerProps {
//   x?: number;
//   y?: number;
// }

interface IViewportProps {
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

// PIXI.SETTINGS.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

const useIteration = (incr = 0.1): number => {
  const [i, setI] = useState(0);

  useTick((delta) => {
    setI((i) => i + incr * delta);
  });

  return i;
};

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
});

// create a component that can be consumed that automatically pass down the app
const PixiViewport = forwardRef((props: any, ref) => {
  return <PixiViewportComponent ref={ref} app={useApp()} {...props} />;
});
PixiViewport.displayName = 'PixiViewport';

// Wiggling bee
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

function drawHexGrid(graphics: Graphics, honeycomb: IHoneyComb): Graphics {
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

// TODO: make intrectactive
const PixiHoneycombComponent = PixiComponent<IHoneycombProps, Graphics>('Honeycomb', {
  create: (props) => {
    console.log('create honeycomb grid');
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

const App: FC = () => {
  // console.log('loading app...');

  // get the actual viewport instance
  const viewportRef = useRef();
  const honeycombRef = useRef();

  // get ref of the bee to follow
  const beeRef = useRef();

  // const [following, setFollowing] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(DEMO_ADDRESS[0]);
  const [gameState, setGameState] = useState<IGameState>(INIT_GAME_STATE);

  const addPlayer = useCallback(
    (address: string): void => {
      // console.log('addPlayer', address);
      const { players, honeycomb } = gameState;

      const playersCount = Object.keys(gameState.players).length;
      // console.log('playersCount', playersCount);

      if (playersCount >= SETTINGS.maxPlayers) {
        console.log('max players reached');
        // TODO: automatically search for another game
        return;
      }

      // check if player already exists
      if (players[address]) {
        console.log('player already exists');
        return;
      }

      const spawnCoords = coordToString(SPAWN_POINTS[playersCount]);

      const playerState: IPlayerState = {
        ...INIT_PLAYER_STATE,
        status: 'idle',
        coords: spawnCoords,
        points: SETTINGS.initialPoints,
      };

      setGameState({
        ...gameState,
        honeycomb: {
          ...honeycomb,
          [spawnCoords]: {
            ...honeycomb[spawnCoords],
            addresses: [...honeycomb[spawnCoords].addresses, address],
          },
        },
        status: playersCount + 1 >= SETTINGS.maxPlayers ? 'ready' : 'queuing',
        players: {
          ...players,
          [address]: playerState,
        },
      });
    },
    [gameState, setGameState]
  );

  const play = (): void => {
    // clean previous game state
    const { status } = gameState;

    if (status === 'playing') return;

    if (status === 'finished' || status === 'ready') {
      // start a new game, reset all states
      setGameState({
        ...INIT_GAME_STATE,
        status: 'queuing',
      });
    }

    //
    addPlayer(currentAddress);
  };

  const changePlayer = (): void => {
    const addressList = Object.keys(gameState.players);
    const currentPlayerIndex = addressList.indexOf(currentAddress);
    const nextIndex = currentPlayerIndex + 1 >= addressList.length ? 0 : currentPlayerIndex + 1;

    if (nextIndex === currentPlayerIndex) {
      console.log('nothing to change');
      return;
    }

    console.log(`changin ${trimAddress(currentAddress)} to ${trimAddress(addressList[nextIndex])}`);
    setCurrentAddress(addressList[nextIndex]);
  };

  const move = useCallback(
    (coords?: [number, number]): void => {
      // console.log(gameState);
      const { players, honeycomb } = gameState;
      const player = players[currentAddress];
      console.log(player);
      // console.log('move', coords);

      if (!player) {
        console.log('no player found');
        return;
      }

      // check if current bee is idle or already moving
      if (player.status !== 'idle') {
        console.log(`bee is not idle, is ${player.status as string} cant move`);
        return;
      }

      if (gameState.status !== 'playing') {
        console.log('game is not playing');
        return;
      }

      const currentCoords = coordFromString(player.coords as string);
      const currentHex = Hexagon.get(currentCoords);
      if (!currentHex) {
        console.log('no hex found for bee coords ', player.coords);
        return;
      }

      const neighbors = Hexagon.neighborsOf(currentHex).filter((hex) => hex !== undefined);
      let movingTo;

      if (!coords) {
        movingTo = neighbors[Math.floor(Math.random() * neighbors.length)];
        console.log('no neighbors found');
      } else {
        movingTo = Hexagon.get(coords);
      }

      // verify if moving to is a valid hexagon on neighbors
      if (!(neighbors as any).includes(movingTo)) {
        console.log('moving to is not a valid neighbor');
        return;
      }

      if (!movingTo) {
        console.log('no hex found for moving to ', movingTo);
        return;
      }

      const movingToCoords = coordToString([movingTo.x, movingTo.y]);

      setGameState({
        ...gameState,
        honeycomb: {
          ...honeycomb,
          [movingToCoords]: {
            ...honeycomb[movingToCoords],
            addresses: [...honeycomb[movingToCoords].addresses, currentAddress],
          },
        },
        players: {
          ...players,
          [currentAddress]: {
            ...player,
            // status: 'moving', // only used for UI, same as dead status
            points: player.points - 10, // TODO: move this logic to backend or add logic to main ticker
            coords: coordToString([movingTo.x, movingTo.y]),
          },
        },
      });

      // TODO: test if all init with 3 neighbors at SPAWN_POINT
      console.log(
        `moving player ${trimAddress(currentAddress)} from  ${currentHex.x}, ${currentHex.y} to ${movingTo.x}, ${
          movingTo.y
        }`
      );
    },
    [currentAddress, gameState, setGameState]
  );

  const { width, height } = useWindowSize();
  // console.log('width', width, 'height', height);

  // const onCreate = (hex: Hex<{ size: number; moisture: number }>): void => {
  //   // console.log('onCreateCallback', hex)
  // };

  const onClick = useCallback(
    (event: any): void => {
      const { status, players, block, honeycomb } = gameState;
      // console.log('clicked', event, players);

      // get point to hex (coordinates) from world coords
      const hexCoordinates = Grid.pointToHex({ x: event.world.x, y: event.world.y });
      if (!hexCoordinates) {
        console.log('no hex found for ', event.world.x, event.world.y);
        return;
      }

      // get hex from hex coordinates
      const hex = Hexagon.get(hexCoordinates);
      if (!hex) {
        console.log('no hex found for ', hexCoordinates);
        return;
      }

      move([hex.x, hex.y]);
    },
    [gameState, move]
  );

  useEffect(() => {
    console.log('useEffect');
    const { status, players, block, honeycomb } = gameState;

    // console.log(viewportRef.current);

    if (viewportRef.current) {
      const viewport = viewportRef.current as Viewport;
      viewport.off('clicked');
      viewport.on('clicked', onClick);
    }

    const interval = setInterval(() => {
      // check if playing
      if (status !== 'playing') {
        // RM this only for testing, add a new player using the demos address
        if (status === 'queuing') {
          addPlayer(DEMO_ADDRESS[Object.keys(players).length]);
        } else if (status === 'ready') {
          // queueing finished, start game
          setGameState({
            ...gameState,
            status: 'playing',
          });
        }
        return;
      }

      console.log('tick');

      // check for win conditions or game end

      const nextBlock = block + 1;
      const newPlayers = { ...players };
      const newHoneycomb = { ...honeycomb };

      // every n ticks remove one hex in spral ring starting from the center
      const numberOfBlocks = 10;
      if (nextBlock % numberOfBlocks === 0) {
        const radius = SETTINGS.radius;
        const ring = radius - Math.floor(nextBlock / numberOfBlocks) + 1;

        if (ring >= 1) {
          // console.log('ring', Math.floor(nextBlock % 10));
          let result = 0;
          let tmp = 0;
          let tmp2 = 0;

          // get index recursively
          for (let i = 1; i <= ring; i++) {
            tmp = i * 6;

            result = tmp + tmp2;
            tmp = tmp2;
            tmp2 = result;
          }

          for (let j = 0; j < ring * 6; j++) {
            // start from result backwards
            const currentHex = Hexagon.get(result - j);

            if (!currentHex) {
              console.info('no hex found for current coords ', j);
              continue;
            }

            const coords = `${currentHex.x},${currentHex.y}`;
            const hex = newHoneycomb[coords];

            if (!hex) {
              console.info('no hex found for coords ', coords);
              continue;
            }

            newHoneycomb[coords] = {
              ...newHoneycomb[`${currentHex.x},${currentHex.y}`],
              cursed: true,
              redward: false, // cursed hexes can not  redward
            };
          }
        }
      }

      // calculate all player points this block
      for (const [address, player] of Object.entries(newPlayers)) {
        // if (player.status === 'dead') continue;
        if (player.points <= 0) {
          newPlayers[address] = {
            ...player,
            status: 'dead',
            points: 0,
          };
        } else {
          // reduce 1 per block
          let newPoints = player.points - 1;

          // if a bee is in a hex with honey (redward) gets + 100 points
          if (newHoneycomb[player.coords as string].redward) {
            newPoints += 100;
          }

          // if a bee is in the same hex as another bee, the bee with the highest points steals the others
          const beeAddresses = honeycomb[player.coords as string].addresses;
          console.log('beeAddresses', beeAddresses);

          // TODO: review this logic
          if (beeAddresses.length > 1) {
            const beePoints = beeAddresses.map((address) => newPlayers[address].points);
            const maxPoints = Math.max(...beePoints);
            const maxPointsAddress = beeAddresses.find((address) => newPlayers[address].points === maxPoints);
            console.log('maxPointsAddress', maxPointsAddress);
            console.log('maxPoints', maxPoints);
            console.log('address', address);

            if (maxPointsAddress === address) {
              newPoints = newPlayers[maxPointsAddress].points;
            } else {
              newPoints = 0;
            }
          }

          // if a bee is in a cursed hex, it dies
          if (newHoneycomb[player.coords as string].cursed) {
            newPoints = 0;
          }

          newPlayers[address] = {
            ...player,
            points: newPoints,
          };
        }
      }

      // randomly spawn a redward to an empty honeycomb hex with a chance of 1 in SETTINGS.radius * 2
      if (Math.random() * SETTINGS.radius * 2 < 1) {
        const emptyHexes = Object.keys(newHoneycomb).filter((hex) => {
          const { addresses, cursed, redward } = newHoneycomb[hex];
          return !cursed && !redward && addresses.length === 0;
        });
        // console.log('emptyHexes', emptyHexes);

        // check if at least one empty hex
        if (emptyHexes.length === 0) {
          console.log('no empty hexes to spawn redward');
          return;
        }

        // check if there is a honeycomb hex with a redward
        const redwardHexes = Object.keys(newHoneycomb).filter((hex) => {
          const { redward } = newHoneycomb[hex];
          return redward;
        });

        if (redwardHexes.length > 0) {
          console.log(`redward already present on coords ${redwardHexes} `);
          return;
        }

        // get random empty hex
        const randomHex = emptyHexes[Math.floor(Math.random() * emptyHexes.length)];

        // get hex from hexagon
        const hexCoords = Hexagon.get(coordFromString(randomHex));
        console.log('hexCoords', hexCoords);

        if (!hexCoords) {
          console.log('no honeycomb hex found for ', randomHex);
          return;
        }

        // redward a random empty hex
        newHoneycomb[randomHex] = {
          ...newHoneycomb[randomHex],
          redward: true,
        };
      }

      // check for end game conditions
      const playersCount = Object.values(gameState.players).filter((player) => player.points > 0).length;
      const endGame = playersCount <= 1;
      const winner =
        playersCount === 1
          ? Object.keys(gameState.players).find((address) => gameState.players[address].points > 0)
          : null;

      setGameState({
        ...gameState,
        players: newPlayers,
        honeycomb: newHoneycomb,
        status: endGame ? 'finished' : status,
        // TODO: review this, not sure if its needed in the global gamestate
        prevGameResults: endGame
          ? players[currentAddress].points > 0
            ? 'You win!'
            : playersCount === 1
            ? `You lose! ${trimAddress(winner as string)} won`
            : 'Draw! nobee survived'
          : '',
        block: !endGame ? nextBlock : block,
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState, currentAddress, addPlayer, onClick]);

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

  const { status, players, honeycomb, block, prevGameResults } = gameState;

  const player = gameState.players[currentAddress];

  return (
    <>
      <div className="absolute buttons-group top-2 left-2">
        {status === 'loading' && <p>Loading...</p>}

        {(status === 'finished' || status === 'loaded') && (
          <>
            <button
              onClick={(): void => {
                play();
              }}>
              Play {prevGameResults ? 'again' : 'game'}
            </button>
            {prevGameResults && <p className="p-2 mt-2 text-2xl bg-white">{prevGameResults}</p>}
          </>
        )}

        {status === 'queuing' && (
          <>
            <p>Waiting for players... {Object.keys(players).length}/6</p>
            <button
              onClick={(): void => {
                addPlayer(DEMO_ADDRESS[Object.keys(players).length]);
              }}>
              Add demo player
            </button>
          </>
        )}

        {status === 'playing' && (
          <>
            <button onClick={(): void => move()}>Auto Move</button>
            <button onClick={(): void => changePlayer()}>Next Bee</button>
            {/* <button onClick={(): void => toggleFollow()}>{!following ? 'Follow' : 'Stop Follow'}</button>
            <button onClick={(): void => centerBee()}>Center</button> */}

            <p className="p-2 mt-2 text-2xl bg-white">
              <small>Playing as {trimAddress(currentAddress)}</small> <br />
              <small>
                {player.status === 'moving'
                  ? `Moving to ${player.coords}`
                  : player.status === 'dead'
                  ? `Died at ${player.coords}`
                  : `Iddling at ${player.coords}`}
              </small>{' '}
              <br />
              <small>Points {player.points}</small> <br />
              <small>Current block {block}</small>
            </p>
          </>
        )}
      </div>

      <Stage {...stageProps}>
        <PixiViewport
          ref={viewportRef}
          plugins={['drag', 'pinch', 'wheel']}
          // plugins={['drag', 'pinch', 'wheel', 'bounce']}
          screenWidth={width}
          screenHeight={height}
          // worldWidth={worldWidth}
          // worldHeight={worldHeight}
          didMount={(viewport: Viewport): void =>
            setGameState({
              ...gameState,
              status: 'loaded',
            })
          }
          // pointerdown={(event: any): void => {
          //   // console.log('pointerdown', event);

          //   const { offsetX, offsetY } = event.data.originalEvent;
          //   const hexCoordinates = Grid.pointToHex({ x: offsetX, y: offsetY });
          //   if (!hexCoordinates) {
          //     console.log('no hex found for ', offsetX, offsetY);
          //     return;
          //   }

          //   // get hex from hex coordinates
          //   const hex = Hexagon.get(hexCoordinates);
          //   if (!hex) {
          //     console.log('no hex found for ', hexCoordinates);
          //     return;
          //   }
          //   console.log('hex', hex);
          //   move([hex.x, hex.y]);
          // }}
        >
          {/* {status !== 'loading' && ( */}
          <PixiContainer>
            <PixiHoneycomb ref={honeycombRef} honeycomb={honeycomb} />
            {players &&
              Object.entries(players).map(([address, player]) => (
                <BeeComponent
                  players={players}
                  address={address}
                  ref={address === currentAddress ? beeRef : undefined}
                  key={address}
                />
              ))}
          </PixiContainer>
          {/* )} */}
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
