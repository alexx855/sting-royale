import { useEthersAppContext } from 'eth-hooks/context';
import React, { FC } from 'react';

import { IScaffoldAppProviders } from '~~/components/main/hooks/useScaffoldAppProviders';

export interface IMainPageGameProps {
  scaffoldAppProviders: IScaffoldAppProviders;
  children?: React.ReactNode;
}

export const MainPageGame: FC<IMainPageGameProps> = (props) => {
  const ethersAppContext = useEthersAppContext();
  const selectedChainId = ethersAppContext.chainId;
  console.log(selectedChainId && selectedChainId !== props.scaffoldAppProviders.targetNetwork.chainId);

  return (
    <div className="pixi">
      <h2>MainPageGame</h2>
      {props.children}
    </div>
  );
};
