import { Article } from "../../Article/Article";
import styled from "styled-components";
import SidebarMenu from "../../SidebarMenu/SidebarMenu";
import { useState } from "react";
import HomeownersAdd from "./components/HomeownersAdd/HomeownersAdd";
import PropertyAdd from "./components/PropertyAdd/PropertyAdd";
import PropertyView from "./components/PropertyView/PropertyView";
import HomeownersView from "./components/HomeownersView/HomeownersView";
import UsagesAdd from "./components/UsagesAdd/UsagesAdd";
import Home from "./components/Home/Home";
import UsagesView from "./components/UsagesView/UsagesView";

const StyledDiv = styled.div`
  background-color: ${props => props.theme.siteBackgroundColor};
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100vh;
  color: ${props => props.theme.siteFontColor};
`;

interface page {
  id: string;
  component: any;
  isActive: boolean;
}

const AdminDashboard = () => {
  const [pages, setPages] = useState<page[]>([
    {
      id: "home",
      component: <Home />,
      isActive: false
    },
    {
      id: "add_homeowner",
      component: <HomeownersAdd />,
      isActive: false
    },
    {
      id: "view_homeowner",
      component: <HomeownersView />,
      isActive: false
    },
    {
      id: "add_property",
      component: <PropertyAdd />,
      isActive: false
    },
    {
      id: "view_property",
      component: <PropertyView />,
      isActive: false
    },
    {
      id: "add_usage_by_homeowner",
      component: <UsagesAdd />,
      isActive: false
    },
    {
      id: "add_usage_by_order",
      component: <UsagesAdd />,
      isActive: false
    },
    {
      id: "view_usage",
      component: <UsagesView />,
      isActive: false
    },
    {
      id: "view_payments",
      component: <UsagesView />,
      isActive: false
    },
    {
      id: "add_payment",
      component: <UsagesView />,
      isActive: false
    }
  ]);

  const onMenuItemClick = (item: string): void => {
    const tmpPages = pages.map(page => {
      return { ...page, isActive: item === page.id };
    });

    setPages(tmpPages);
  };

  // TODO: Add "key" to map
  return (
    <StyledDiv>
      <SidebarMenu onMenuItemClick={onMenuItemClick} />
      {pages.map(page => {
        if (!page.isActive) return null;

        return page.component;
      })}
    </StyledDiv>
  );
};

export default AdminDashboard;
