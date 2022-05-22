import '~~/styles/main-page.css';

import { GenericContract } from 'eth-components/ant/generic-contract';
import { useBalance, useEthersAdaptorFromProviderOrSigners } from 'eth-hooks';
import { useEthersAppContext } from 'eth-hooks/context';
// import { useDexEthPrice } from 'eth-hooks/dapps';
import { asEthersAdaptor } from 'eth-hooks/functions';
import React, { FC, useEffect, useState } from 'react';
import { BrowserRouter, Switch } from 'react-router-dom';

import { MainPageGame, MainPageHeader, createPagesAndTabs, TContractPageList } from './components/main';

import { ThemeSwitcher } from '~~/components/common';
import { useAppContracts, useConnectAppContracts, useLoadAppContracts } from '~~/components/contractContext';
import { useCreateAntNotificationHolder } from '~~/components/main/hooks/useAntNotification';
import { useBurnerFallback } from '~~/components/main/hooks/useBurnerFallback';
import { useScaffoldProviders as useScaffoldAppProviders } from '~~/components/main/hooks/useScaffoldAppProviders';
import { BURNER_FALLBACK_ENABLED, MAINNET_PROVIDER } from '~~/config/app.config';

/**
 * ⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️
 * See config/app.config.ts for configuration, such as TARGET_NETWORK
 * See appContracts.config.ts and externalContracts.config.ts to configure your contracts
 * See pageList variable below to configure your pages
 * See web3Modal.config.ts to configure the web3 modal
 * ⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️⛳️
 *
 * For more
 */

/**
 * The main component
 * @returns
 */
export const MainPage: FC = () => {
  const notificationHolder = useCreateAntNotificationHolder();
  // -----------------------------
  // Providers, signers & wallets
  // -----------------------------
  // 🛰 providers
  // see useLoadProviders.ts for everything to do with loading the right providers
  const scaffoldAppProviders = useScaffoldAppProviders();

  // 🦊 Get your web3 ethers context from current providers
  const ethersAppContext = useEthersAppContext();

  // if no user is found use a burner wallet on localhost as fallback if enabled
  useBurnerFallback(scaffoldAppProviders, BURNER_FALLBACK_ENABLED);

  // -----------------------------
  // Load Contracts
  // -----------------------------
  // 🛻 load contracts
  useLoadAppContracts();
  // 🏭 connect to contracts for mainnet network & signer

  const exampleMainnetProvider = scaffoldAppProviders.mainnetAdaptor?.provider;
  const currentChainId: number | undefined = ethersAppContext.chainId;

  const [mainnetAdaptor] = useEthersAdaptorFromProviderOrSigners(MAINNET_PROVIDER);
  useConnectAppContracts(mainnetAdaptor);
  // 🏭 connec to  contracts for current network & signer
  useConnectAppContracts(asEthersAdaptor(ethersAppContext));

  // // -----------------------------
  // // Hooks use and examples
  // // -----------------------------
  // // 🎉 Console logs & More hook examples:
  // // 🚦 disable this hook to stop console logs
  // // 🏹🏹🏹 go here to see how to use hooks!
  // useScaffoldHooksExamples(scaffoldAppProviders);

  // -----------------------------
  // These are the contracts!
  // -----------------------------

  // init contracts
  // const hiveContract = useAppContracts('Hive', ethersAppContext.chainId);
  const beeContract = useAppContracts('Bee', ethersAppContext.chainId);

  // const mainnetDai = useAppContracts('DAI', NETWORKS.mainnet.chainId);

  // console.log(NETWORKS.mainnet.chainId);

  // keep track of a Bee's from the contract in the local React state:
  // console.log(beeContract);
  // useContractReader(
  //   beeContract,
  //   hiveContract?.purpose,
  //   [],
  //   hiveContract?.filters.SetPurpose()
  // );

  // const [purpose, update] = useContractReader(
  //   hiveContract,
  //   hiveContract?.purpose,
  //   [],
  //   hiveContract?.filters.SetPurpose()
  // );

  // 📟 Listen for broadcast events
  // const [setPurposeEvents] = useEventListener(hiveContract, 'SetPurpose', 0);

  // -----------------------------
  // .... 🎇 End of examples
  // -----------------------------
  // 💵 This hook will get the price of ETH from 🦄 Uniswap:
  // const [ethPrice] = useDexEthPrice(scaffoldAppProviders.mainnetAdaptor?.provider, scaffoldAppProviders.targetNetwork);

  // 💰 this hook will get your balance
  const [yourCurrentBalance] = useBalance(ethersAppContext.account);
  // console.log(yourCurrentBalance);

  const [route, setRoute] = useState<string>('');
  useEffect(() => {
    setRoute(window.location.pathname);
  }, [setRoute]);

  // ---------------------
  // 🏦 get your balance
  // ---------------------
  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  // const [yourLocalBalance] = useBalance(ethersAppContext.account);

  // // Just plug in different 🛰 providers to get your balance on different chains:
  // const [yourMainnetBalance, yUpdate, yStatus] = useBalance(ethersAppContext.account, mergeDefaultUpdateOptions(), {
  //   adaptorEnabled: true,
  //   adaptor: mainnetAdaptor,
  // });

  // console.log('🏦 yourLocalBalance:', yourLocalBalance);
  // console.log('🏦 yourMainnetBalance:', yourMainnetBalance);
  // console.log('🏦 yUpdate:', yUpdate);
  // console.log('🏦 yStatus:', yStatus);

  // Update your collectibles
  //
  // 🧠 This effect will update yourCollectibles by polling when your balance changes
  //

  // keep track of a variable from the contract in the local React state:
  // const balance = useContractReader(readContracts, "YourCollectible", "balanceOf", [address]);
  // console.log("🤗 balance:", balance);

  // const yourBalance = balance && balance.toNumber && balance.toNumber();
  const [yourCollectibles, setYourCollectibles] = useState();
  useEffect(() => {
    // console.log('💰 yourCurrentBalance:', yourCurrentBalance);
    //   const collectibleUpdate = [];
    // for (let tokenIndex = 0; tokenIndex < balance; tokenIndex++) {
    //   try {
    //     console.log('GEtting token index', tokenIndex);
    //     const tokenId = await readContracts.YourCollectible.tokenOfOwnerByIndex(address, tokenIndex);
    //     console.log('tokenId', tokenId);
    //     const tokenURI = await readContracts.YourCollectible.tokenURI(tokenId);
    //     const jsonManifestString = atob(tokenURI.substring(29));
    //     console.log('jsonManifestString', jsonManifestString);
    //     /*
    //       const ipfsHash = tokenURI.replace("https://ipfs.io/ipfs/", "");
    //       console.log("ipfsHash", ipfsHash);
    //       const jsonManifestBuffer = await getFromIPFS(ipfsHash);
    //     */
    //     try {
    //       const jsonManifest = JSON.parse(jsonManifestString);
    //       console.log('jsonManifest', jsonManifest);
    //       collectibleUpdate.push({ id: tokenId, uri: tokenURI, owner: address, ...jsonManifest });
    //     } catch (e) {
    //       console.log(e);
    //     }
    //   } catch (e) {
    //     console.log(e);
    //   }
    // }
    // setYourCollectibles(collectibleUpdate.reverse());
    // console.log('💰 yourCurrentBalance:', yourCurrentBalance);
  }, [ethersAppContext.account, yourCurrentBalance]);

  // -----------------------------
  // 📃 Page List
  // -----------------------------
  // This is the list of tabs and their contents
  const pageList: TContractPageList = {
    mainPage: {
      name: 'Game',
      content: <MainPageGame scaffoldAppProviders={scaffoldAppProviders} />,
    },
    pages: [
      {
        name: 'Bee',
        content: (
          <div style={{ marginTop: '100px' }}>
            {/* {yourCollectibles && (
              <List
                bordered
                dataSource={yourCollectibles}
                renderItem={(item: any): any => {
                  const id = item.id.toNumber();
                  const key = `${id}_${item.uri || ''}_${item.owner || ''}`;
                  return (
                    <List.Item key={key}>
                      <Card
                        title={
                          <div>
                            <span style={{ fontSize: 18, marginRight: 8 }}>{item.name}</span>
                          </div>
                        }>
                        <img src={item.image || 'noimage'} />
                      </Card>
                    </List.Item>
                  );
                }}
              />
            )}

            {!yourCollectibles && <div>You do not have any collectibles yet!</div>} */}
          </div>
        ),
      },
      // TODO: some day, a fully dex game
      // {
      //   name: 'Hive',
      //   content: (
      //     <div style={{ marginTop: '100px' }}>
      //       <GenericContract
      //         contractName="Hive"
      //         contract={hiveContract}
      //         mainnetAdaptor={scaffoldAppProviders.mainnetAdaptor}
      //         blockExplorer={scaffoldAppProviders.targetNetwork.blockExplorer}
      //       />
      //     </div>
      //   ),
      // },
      {
        name: 'Contract',
        content: (
          <div style={{ marginTop: '100px' }}>
            <GenericContract
              contractName="Bee"
              contract={beeContract}
              mainnetAdaptor={scaffoldAppProviders.mainnetAdaptor}
              blockExplorer={scaffoldAppProviders.targetNetwork.blockExplorer}></GenericContract>
          </div>
        ),
      },
      // {
      //   name: 'Dai',
      //   content: (
      //     <div style={{ marginTop: '100px' }}>
      //       <GenericContract
      //         contractName="Dai"
      //         contract={mainnetDai}
      //         mainnetAdaptor={scaffoldAppProviders.mainnetAdaptor}
      //         blockExplorer={scaffoldAppProviders.targetNetwork.blockExplorer}
      //       />
      //     </div>
      //   ),
      // },
    ],
  };
  const { tabContents, tabMenu } = createPagesAndTabs(pageList, route, setRoute);

  return (
    <div className="App">
      <MainPageHeader scaffoldAppProviders={scaffoldAppProviders} />
      {/* Routes should be added between the <Switch> </Switch> as seen below */}
      <BrowserRouter>
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            zIndex: 10,
          }}>
          {tabMenu}
        </div>

        <Switch>{tabContents}</Switch>
      </BrowserRouter>

      <div style={{ zIndex: 11, position: 'absolute' }}>
        <ThemeSwitcher />
      </div>

      <div style={{ position: 'absolute' }}>{notificationHolder}</div>
    </div>
  );
};
