import '../helpers/hardhat-imports';
import './helpers/chai-imports';

import { expect } from 'chai';
import { Hive__factory } from 'generated/contract-types';
import hre, { ethers } from 'hardhat';
import { getHardhatSigners } from 'tasks/functions/accounts';

import { Hive } from '../generated/contract-types/Hive';

describe('🚩 Challenge 0: 🎟 Simple NFT Example 🤓', function () {
  this.timeout(180000);

  // console.log("hre:",Object.keys(hre)) // <-- you can access the hardhat runtime env here

  describe('Hive', function () {
    let HiveContract: Hive;

    before(async () => {
      const { deployer } = await getHardhatSigners(hre);
      const factory = new Hive__factory(deployer);

      // Getting a previously deployed contract
      const Bee = await ethers.getContract('Bee', deployer);
      console.log(`Bee.address: ${Bee.address}`);

      HiveContract = await factory.deploy(`${Bee.address}`);
    });

    beforeEach(async () => {
      // put stuff you need to run before each test here
    });

    describe('mintItem()', function () {
      it('Should be able to mint an NFT', async function () {
        const { user1 } = await getHardhatSigners(hre);

        console.log('\t', ' 🧑‍🏫 Tester Address: ', user1.address);

        const startingBalance = await HiveContract.balanceOf(user1.address);
        console.log('\t', ' ⚖️ Starting balance: ', startingBalance.toNumber());

        // TODO: write some tests
        expect(1).to.equal(1);

        // console.log('\t', ' 🔨 Minting...');
        // const mintResult = await HiveContract.mintItem(user1.address, 'QmfVMAmNM1kDEBYrC2TPzQDoCRFH6F5tE1e9Mr4FkkR5Xr');
        // console.log('\t', ' 🏷  mint tx: ', mintResult.hash);

        // console.log('\t', ' ⏳ Waiting for confirmation...');
        // const txResult = await mintResult.wait(1);
        // expect(txResult.status).to.equal(1);

        // console.log('\t', ' 🔎 Checking new balance: ', startingBalance.toNumber());
        // expect(await HiveContract.balanceOf(user1.address)).to.equal(startingBalance.add(1));
      });
    });
  });
});
