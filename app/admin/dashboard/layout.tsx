"use client";

import styled from "styled-components";
import SidebarMenu from "./components/SidebarMenu/SidebarMenu";

const StyledDiv = styled.div`
  background-color: ${props => props.theme.siteBackgroundColor};
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100vh;
  color: ${props => props.theme.siteFontColor};
`;

function onMenuItemClick() {}

const Layout = () => {
  return (
    <StyledDiv>
      <SidebarMenu onMenuItemClick={onMenuItemClick} />
    </StyledDiv>
  );
};

export default Layout;
