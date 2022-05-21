/* eslint-disable prettier/prettier */
import { ethers } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';
import { THardhatRuntimeEnvironmentExtended } from 'helpers/types/THardhatRuntimeEnvironmentExtended';

const func: DeployFunction = async (hre: THardhatRuntimeEnvironmentExtended) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  // Getting a previously deployed contract
  const Bee = await ethers.getContract('Bee', deployer);
  console.log(`Bee.address: ${Bee.address}`);

  // await Bee.setPurpose("Hello");

  const Hive = await deploy('Hive', {
    from: deployer,
    args: [Bee.address],
    log: true,
  });

  console.log(`Hive.address: ${Hive.address}`);
};
export default func;
func.tags = ['Hive'];

/*
Tenderly verification
let verification = await tenderly.verify({
  name: contractName,
  address: contractAddress,
  network: targetNetwork,
});
*/
