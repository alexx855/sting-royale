import React, { FC } from 'react';

// import { useEthersAppContext } from 'eth-hooks/context';

import { IScaffoldAppProviders } from '~~/components/main/hooks/useScaffoldAppProviders';

export interface IMainPageGameProps {
  scaffoldAppProviders?: IScaffoldAppProviders;
  children?: React.ReactNode;
}

export const MainPageGame: FC<IMainPageGameProps> = (props) => {
  return (
    <div style={{ display: 'none' }}>
      <h2>About the game</h2>
      {props.children}
    </div>
  );
};
