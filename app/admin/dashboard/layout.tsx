"use client";

import styled from "../../theme/styled-components";
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

const Layout = (props: any) => {
  return (
    <>
      <StyledDiv>
        <SidebarMenu onMenuItemClick={onMenuItemClick} />
        {props.children}
      </StyledDiv>
    </>
  );
};

export default Layout;
