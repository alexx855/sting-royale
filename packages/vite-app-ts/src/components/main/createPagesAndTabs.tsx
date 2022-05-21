import { Menu, MenuProps } from 'antd';
import React from 'react';
import { Link, Route } from 'react-router-dom';
/**
 * A name and element that represents a page
 */
type TContractPage = {
  name: string;
  content: JSX.Element;
};

export type TContractPageList = {
  /**
   * the default page to load on route '/'
   */
  mainPage: TContractPage;
  /**
   * an array of all the other pages
   */
  pages: TContractPage[];
};

/**
 * Helper function that creates pages with routes.  It also creates tabs (menu items) associated with those routes, so that you can click on them to navigate to the page.
 * @param pageList
 * @param route
 * @param setRoute
 * @returns
 */
export const createPagesAndTabs = (
  pageList: TContractPageList,
  route: string,
  setRoute: (route: string) => void
): { tabMenu: JSX.Element; tabContents: JSX.Element } => {
  const getPath = (n: string): string => {
    return n.replaceAll(' ', '-');
  };

  const menuItems: MenuProps['items'] = [
    {
      label: (
        <Link
          onClick={(): void => {
            setRoute('/');
          }}
          to="/">
          {pageList.mainPage.name}
        </Link>
      ),
      key: 'root',
    },
  ];

  for (const page of pageList.pages) {
    menuItems.push({
      label: (
        <Link
          onClick={(): void => {
            setRoute(getPath(page.name));
          }}
          to={getPath(page.name)}>
          {page.name}
        </Link>
      ),
      key: page.name,
    });
  }

  const tabMenu = (
    <Menu
      style={{
        textAlign: 'center',
      }}
      selectedKeys={[route]}
      mode="horizontal"
      items={menuItems}
    />
  );

  const pageContent = (
    <>
      <Route key={'main'} exact path={'/'}>
        {pageList.mainPage.content}
      </Route>
      {pageList.pages.map(({ name, content }) => (
        <Route key={name} path={'/' + getPath(name)}>
          {content}
        </Route>
      ))}
    </>
  );

  return { tabMenu: tabMenu, tabContents: pageContent };
};
