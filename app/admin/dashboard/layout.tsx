"use client";

import styled from "../../theme/styled-components";
import SidebarMenu from "./components/SidebarMenu/SidebarMenu";

const StyledDiv = styled.div`
  background-color: ${props => props.theme.siteBackgroundColor};
  display: flex;
  flex-direction: row;
  width: 100%;
  min-height: 100vh;
  color: ${props => props.theme.siteFontColor};

  @media print {
    background-color: white;
  }
`;

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Layout component that wraps the main application content with a sidebar menu.
 *
 * @param {LayoutProps} props - The props for the layout component.
 * @returns {JSX.Element} The rendered layout component.
 */
const Layout = ({ children }: LayoutProps): JSX.Element => {
  return (
    <StyledDiv>
      <SidebarMenu />
      {children}
    </StyledDiv>
  );
};

export default Layout;
