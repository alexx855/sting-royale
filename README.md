# Sting Royale

A simple battle royale game where users battle as a BEE and the winner can claim an NFT of the Bee!

Dodge, weave, and fly your way through a honeycomb maze. Bees never stop moving and will sting you if you get too close, so watch out! The objective is to survive as long as possible and be the last one.

# Description

Users starts with a burner wallet or can login using a custom provider (Metamask, Coinbase Wallet and WalletConnect ) on the Polygon Mumbai Testnet.

Once the user join a game (Hive), a the system will wait for a the at least the Hive to be completed of Bees (6 in total).

The objective is to survive. BEEs never stop moving, their start on a random position at the HIVE, users can control the BEE direction with actions 1 time per block. Users can kill other bees or being killed by others as well (the one with more points win the battle)

Also watch out of red zones (one ring turns red every 10 blocks killing all bees there).

## Demo video

[![video](https://raw.githubusercontent.com/alexx855/sting-royale/release/cover.png)](https://www.youtube.com/watch?v=cj8Ib7IUUSQ)

### Generate video speech for the video

```
curl -H "Authorization: Bearer $(gcloud auth application-default print-access-token)" \
  -H "Content-Type: application/json; charset=utf-8" --data "{
    'input':{
     'ssml':'<speak>Welcome to my project submission for Hack the Money 2022. <break time=\'300ms\'/> <emphasis level=\'strong\'>Sting Royale</emphasis>
     it was developed and designed all by myself, <break time=\'300ms\'/> I\'m Alex <break time=\'300ms\'/> a 28 years old self taught software developer from Argentina, <break time=\'300ms\'/> i began teaching myself how to code, <break time=\'300ms\'/>  build and maintain systems <break time=\'300ms\'/>  since i was 16 <break time=\'300ms\'/>  and i have never stopped from then. <break time=\'600ms\'/>Here is a quick demo of the game, <break time=\'300ms\'/>  it\'s currently only on the Polygon mumbai testnet network, <break time=\'300ms\'/> and it\'s accesible through IPFS too.<break time=\'600ms\'/><emphasis level=\'strong\'>Thanks</emphasis> for watching.</speak>'
    },
    'voice':{
      'languageCode':'en-us',
      'name':'en-US-Standard-B',
      'ssmlGender':'MALE'
    },
    'audioConfig':{
      'audioEncoding':'MP3'
    }
  }" "https://texttospeech.googleapis.com/v1/text:synthesize" > synthesize-ssml.txt



cat synthesize-ssml.txt | grep 'audioContent' | \
sed 's|audioContent| |' | tr -d '\n ":{},' > tmp.txt && \
base64 tmp.txt --decode > synthesize-ssml-audio.mp3 && \
rm tmp.txt

```

# 🏗 Made witth Scaffold-Eth Typescript

It was made using scaffold-eth-typescript (react, vite, typescript, solidity, and hardhat). The players are able to interact with the web client where they can do their moves and claim the nft. I've designed the assets using the Adobe suite and for the web game i've used the pixi.js library.

```bash
packages/vite-app-ts/
packages/hardhat-ts/
```

## Quick Start

Running the app

1. install your dependencies

   ```bash
   yarn install
   ```

2. start a hardhat node

   ```bash
   yarn chain
   ```

3. run the app, `open a new command prompt`

   ```bash
   # build hardhat & external contracts types
   yarn contracts:build
   # deploy your hardhat contracts
   yarn deploy
   # start the app
   yarn start
   ```

4. other commands
   ```bash
   # rebuild all contracts, incase of inconsistent state
   yarn contracts:rebuild
   # run hardhat commands for the workspace, or see all tasks
   yarn hardhat 'xxx'
   # run subgraph commands for the workspace
   yarn subgraph 'xxx'
   ```
