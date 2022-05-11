# Sting Royale

A simple online multiplayer battle royale game where users battle as a BEE and the winner keep the NFT containing the game history.

# 🏗 Scaffold-Eth Typescript

This is the typescript repo of scaffold-eth and it uses `hardhat` and `vite`. The directories that you'll use are:

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
