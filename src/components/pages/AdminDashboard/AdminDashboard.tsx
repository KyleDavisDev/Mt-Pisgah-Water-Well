import { Article } from "../../Article/Article";
import styled from "styled-components";
import SidebarMenu from "../../SidebarMenu/SidebarMenu";
import { useState } from "react";
import HomeownersAdd from "./components/HomeownersAdd/HomeownersAdd";
import PropertyAdd from "./components/PropertyAdd/PropertyAdd";
import PropertyView from "./components/PropertyView/PropertyView";

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
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [showViewProperty, setShowViewProperty] = useState(false);

  const onMenuItemClick = (item: string): void => {
    if (item === "add_homeowner") {
      setShowAddHomeowner(true);

      setShowAddProperty(false);
      setShowViewProperty(false);
      return;
    }

    if (item === "add_property") {
      setShowAddProperty(true);

      setShowAddHomeowner(false);
      setShowViewProperty(false);
      return;
    }

    if (item === "view_property") {
      setShowViewProperty(true);

      setShowAddProperty(false);
      setShowAddHomeowner(false);
      return;
    }
  };

  return (
    <StyledDiv>
      <SidebarMenu onMenuItemClick={onMenuItemClick} />

      <Article size="md">
        {showAddHomeowner && <HomeownersAdd />}
        {showAddProperty && <PropertyAdd />}
        {showViewProperty && <PropertyView />}
      </Article>
    </StyledDiv>
  );
};

export default AdminDashboard;
