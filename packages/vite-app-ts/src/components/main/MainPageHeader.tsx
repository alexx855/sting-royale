import { PageHeader } from 'antd';
import { Account } from 'eth-components/ant';
import {
  connectorErrorText,
  NoStaticJsonRPCProviderFoundError,
  CouldNotActivateError,
  UserClosedModalError,
} from 'eth-hooks/context';
import React, { FC, ReactNode, useCallback } from 'react';

// import { FaucetHintButton } from '~~/components/common/FaucetHintButton';
import { useAntNotification } from '~~/components/main/hooks/useAntNotification';
import { IScaffoldAppProviders } from '~~/components/main/hooks/useScaffoldAppProviders';

// displays a page header
export interface IMainPageHeaderProps {
  scaffoldAppProviders: IScaffoldAppProviders;
  price?: number;
  children?: ReactNode;
}

/**
 * ✏ Header: Edit the header and change the title to your project name.  Your account is on the right *
 * @param props
 * @returns
 */
export const MainPageHeader: FC<IMainPageHeaderProps> = (props) => {
  // const ethersAppContext = useEthersAppContext();
  // const selectedChainId = ethersAppContext.chainId;

  const notification = useAntNotification();

  // 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation
  // const [gasPrice] = useGasPrice(ethersAppContext.chainId, 'fast', getNetworkInfo(ethersAppContext.chainId));
  // console.log('gasPrice', gasPrice);
  /**
   * this shows the page header and other informaiton
   */
  const left = (
    <>
      <div style={{ position: 'absolute', width: '100%', top: 0, left: 0, zIndex: 99 }}>
        <PageHeader
          title=" Sting Royale"
          subTitle={
            // TODO: target dynamic IPFS
            <a href="#" target="_blank" rel="noreferrer">
              IPFS
            </a>
          }
        />
      </div>
      {props.children}
    </>
  );

  const onLoginError = useCallback(
    (e: Error) => {
      if (e instanceof UserClosedModalError) {
        notification.info({
          message: connectorErrorText.UserClosedModalError,
          description: e.message,
        });
      } else if (e instanceof NoStaticJsonRPCProviderFoundError) {
        notification.error({
          message: 'Login Error: ' + connectorErrorText.NoStaticJsonRPCProviderFoundError,
          description: e.message,
        });
      } else if (e instanceof CouldNotActivateError) {
        notification.error({
          message: 'Login Error: ' + connectorErrorText.CouldNotActivateError,
          description: e.message,
        });
      } else {
        notification.error({ message: 'Login Error: ', description: e.message });
      }
    },
    [notification]
  );

  /**
   * 👨‍💼 Your account is in the top right with a wallet at connect options
   */
  const right = (
    <>
      <div style={{ position: 'absolute', textAlign: 'right', right: 0, top: 0, padding: 10, zIndex: 100 }}>
        <Account
          createLoginConnector={props.scaffoldAppProviders.createLoginConnector}
          loginOnError={onLoginError}
          ensProvider={props.scaffoldAppProviders.mainnetAdaptor?.provider}
          price={0}
          // price={props.price}
          blockExplorer={props.scaffoldAppProviders.targetNetwork.blockExplorer}
          hasContextConnect={true}
        />
        {/* <FaucetHintButton scaffoldAppProviders={props.scaffoldAppProviders} gasPrice={gasPrice} /> */}
        {props.children}
      </div>
    </>
  );

  return (
    <>
      {/* {left} */}
      {right}
    </>
  );
};
