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

const AdminDashboard = () => {
  const [showHome, setShowHome] = useState(true);
  const [showAddHomeowner, setShowAddHomeowner] = useState(false);
  const [showViewHomeowner, setShowViewHomeowner] = useState(false);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [showViewProperty, setShowViewProperty] = useState(false);
  const [showAddUsage, setShowAddUsage] = useState(false);
  const [showViewUsage, setShowViewUsage] = useState(false);

  const onMenuItemClick = (item: string): void => {
    if (item === "add_homeowner") {
      setShowAddHomeowner(true);

      setShowAddProperty(false);
      setShowViewProperty(false);
      setShowViewHomeowner(false);
      setShowAddUsage(false);
      setShowViewUsage(false);
      setShowHome(false);
      return;
    }

    if (item === "view_homeowner") {
      setShowViewHomeowner(true);

      setShowAddHomeowner(false);
      setShowAddProperty(false);
      setShowViewProperty(false);
      setShowAddUsage(false);
      setShowViewUsage(false);
      setShowHome(false);
      return;
    }

    if (item === "add_property") {
      setShowAddProperty(true);

      setShowAddHomeowner(false);
      setShowViewProperty(false);
      setShowViewHomeowner(false);
      setShowAddUsage(false);
      setShowViewUsage(false);
      setShowHome(false);
      return;
    }

    if (item === "view_property") {
      setShowViewProperty(true);

      setShowAddProperty(false);
      setShowAddHomeowner(false);
      setShowViewHomeowner(false);
      setShowAddUsage(false);
      setShowViewUsage(false);
      setShowHome(false);
      return;
    }

    if (item === "add_usage") {
      setShowAddUsage(true);

      setShowAddProperty(false);
      setShowAddHomeowner(false);
      setShowViewProperty(false);
      setShowViewHomeowner(false);
      setShowViewUsage(false);
      setShowHome(false);
      return;
    }

    if (item === "view_usage") {
      setShowViewUsage(true);

      setShowViewProperty(false);
      setShowAddProperty(false);
      setShowAddHomeowner(false);
      setShowViewHomeowner(false);
      setShowAddUsage(false);
      setShowHome(false);
      return;
    }

    if (item === "home") {
      setShowHome(true);

      setShowViewUsage(false);
      setShowViewProperty(false);
      setShowAddProperty(false);
      setShowAddHomeowner(false);
      setShowViewHomeowner(false);
      setShowAddUsage(false);
      return;
    }
  };

  return (
    <StyledDiv>
      <SidebarMenu onMenuItemClick={onMenuItemClick} />

      {showHome && <Home />}
      {showAddHomeowner && <HomeownersAdd />}
      {showViewHomeowner && <HomeownersView />}
      {showAddProperty && <PropertyAdd />}
      {showViewProperty && <PropertyView />}
      {showAddUsage && <UsagesAdd />}
      {showViewUsage && <UsagesView />}
    </StyledDiv>
  );
};

export default AdminDashboard;
