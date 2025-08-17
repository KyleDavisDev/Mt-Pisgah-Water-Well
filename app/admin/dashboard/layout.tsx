"use client";

import SidebarMenu from "./components/SidebarMenu/SidebarMenu";
import { StyledDiv } from "./layoutStyle";

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
