import '../helpers/hardhat-imports';
import './helpers/chai-imports';

import { expect } from 'chai';
import { Bee__factory } from 'generated/contract-types';
import hre from 'hardhat';
import { getHardhatSigners } from 'tasks/functions/accounts';

import { Bee } from '../generated/contract-types/Bee';

describe('Bee', function () {
  let BeeContract: Bee;

  before(async () => {
    const { deployer } = await getHardhatSigners(hre);
    const factory = new Bee__factory(deployer);
    BeeContract = await factory.deploy();
  });

  beforeEach(async () => {
    // put stuff you need to run before each test here
  });

  it("Should return the new purpose once it's changed", async function () {
    await BeeContract.deployed();
    // expect(await BeeContract.purpose()).to.equal('Building Unstoppable Apps!!!');

    // TODO: write some tests
    expect(1).to.equal(1);
    // const newPurpose = 'Hola, mundo!';
    // await BeeContract.setPurpose(newPurpose);
    // expect(await BeeContract.purpose()).to.equal(newPurpose);
  });
});
