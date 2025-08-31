import { SidebarMenu } from "./components/SidebarMenu/SidebarMenu";

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
    <div className="flex flex-col w-full min-h-screen text-[theme-font-color] print:bg-white lg:flex-row">
      <SidebarMenu />
      {children}
    </div>
  );
};

export default Layout;
