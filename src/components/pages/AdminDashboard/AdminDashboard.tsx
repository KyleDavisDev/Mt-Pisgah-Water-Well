import { Article } from "../../Article/Article";
import styled from "styled-components";
import SidebarMenu from "../../SidebarMenu/SidebarMenu";
import { useState } from "react";
import HomeownersAdd from "./components/HomeownersAdd/HomeownersAdd";
import PropertyAdd from "./components/PropertyAdd/PropertyAdd";
import PropertyView from "./components/PropertyView/PropertyView";
import HomeownersView from "./components/HomeownersView/HomeownersView";
import UsageAdd from "./components/UsageAdd/UsageAdd";

const StyledDiv = styled.div`
  background-color: ${(props) => props.theme.siteBackgroundColor};
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100vh;
  color: ${(props) => props.theme.siteFontColor};
`;

const AdminDashboard = () => {
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
      return;
    }

    if (item === "view_homeowner") {
      setShowViewHomeowner(true);

      setShowAddHomeowner(false);
      setShowAddProperty(false);
      setShowViewProperty(false);
      setShowAddUsage(false);
      setShowViewUsage(false);
      return;
    }

    if (item === "add_property") {
      setShowAddProperty(true);

      setShowAddHomeowner(false);
      setShowViewProperty(false);
      setShowViewHomeowner(false);
      setShowAddUsage(false);
      setShowViewUsage(false);
      return;
    }

    if (item === "view_property") {
      setShowViewProperty(true);

      setShowAddProperty(false);
      setShowAddHomeowner(false);
      setShowViewHomeowner(false);
      setShowAddUsage(false);
      setShowViewUsage(false);
      return;
    }

    if (item === "add_usage") {
      setShowAddUsage(true);

      setShowAddProperty(false);
      setShowAddHomeowner(false);
      setShowViewProperty(false);
      setShowViewHomeowner(false);
      setShowViewUsage(false);
      return;
    }

    if (item === "view_usage") {
      setShowViewUsage(true);

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

      <Article size="md">
        {showAddHomeowner && <HomeownersAdd />}
        {showViewHomeowner && <HomeownersView />}
        {showAddProperty && <PropertyAdd />}
        {showViewProperty && <PropertyView />}
        {showAddUsage && <UsageAdd />}
        {showViewUsage && <PropertyView />}
      </Article>
    </StyledDiv>
  );
};

export default AdminDashboard;
