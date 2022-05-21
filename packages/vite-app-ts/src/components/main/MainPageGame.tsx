import { Stage } from '@inlet/react-pixi';
import { Viewport } from 'pixi-viewport';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';

// import { useEthersAppContext } from 'eth-hooks/context';

import BeeComponent from '../pixi/PixiBeeComponent';
import PixiContainer from '../pixi/PixiContainer';
import PixiHoneycomb from '../pixi/PixiHoneycomb';
import PixiViewport from '../pixi/PixiViewportComponent';

import { useWindowSize } from './hooks/useWindowSize';

import { IScaffoldAppProviders } from '~~/components/main/hooks/useScaffoldAppProviders';
import {
  DEMO_ADDRESS,
  Grid,
  Hexagon,
  INIT_GAME_STATE,
  INIT_PLAYER_STATE,
  SETTINGS,
  SPAWN_POINTS,
} from '~~/config/game.config';
import { coordFromString } from '~~/functions/coordFromString';
import { coordToString } from '~~/functions/coordToString';
import { createHoneycomb } from '~~/functions/createHoneycomb';
import { trimAddress } from '~~/functions/trimAddress';
import { IGameState, IPlayerState } from '~~/helpers/interfaces';

export interface IMainPageGameProps {
  scaffoldAppProviders?: IScaffoldAppProviders;
  children?: React.ReactNode;
}

export const MainPageGame: FC<IMainPageGameProps> = (props) => {
  // TODO: test spawn points
  // console.log(SPAWN_POINTS[0][0] === Object.values(Hexagon)[0].x, SPAWN_POINTS[0][1] === Object.values(Hexagon)[0].y);

  // save the actual viewport ref
  const viewportRef = useRef();
  const honeycombRef = useRef();
  // save ref of the bee to follow
  const beeRef = useRef();
  // TODO: implement camera follow current bee
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

      let newHon = honeycomb;
      if (Object.keys(honeycomb).length === 0) {
        newHon = createHoneycomb();
      }

      setGameState({
        ...gameState,
        honeycomb: {
          ...newHon,
          [spawnCoords]: {
            ...newHon[spawnCoords],
            addresses: [...newHon[spawnCoords].addresses, address],
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
        honeycomb: createHoneycomb(),
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
      // console.log('move', coords);

      // TODO: check for game state

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

  // call every 1seconds.
  // usePoller(() => {
  //   updateHives();
  // }, 1000);

  useEffect(() => {
    console.log('useEffect');
    const { status, players, block, honeycomb } = gameState;

    // update events for viewport
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

  const { width, height } = useWindowSize();

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

  const { status, players, block, honeycomb, prevGameResults } = gameState;

  const player = players[currentAddress];

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
              Object.keys(players).map((address) => (
                // Object.entries(players).map(([address, player]) => (
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
};
