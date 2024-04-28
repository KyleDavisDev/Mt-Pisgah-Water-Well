import { Link } from "../Link/Link";
import {
  StyledIconContainer,
  StyledMenuItem,
  StyledMenuItemContainer,
  StyledSideBarContainer,
  StyledSubMenuItemContainer,
} from "./SidebarMenuStyle";
import { useState } from "react";

const SidebarMenu = () => {
  const [showHomeowners, setShowHomeowners] = useState<boolean>(false);
  const [showProperties, setShowProperties] = useState<boolean>(false);

  return (
    <StyledSideBarContainer>
      <StyledIconContainer>
        <Link href={"/admin/dashboard"}>
          <img
            src={"https://mtpisgahwell.com/well_icon.png"}
            style={{ height: "75px", backgroundColor: "black" }}
            alt={"Well Icon"}
          />
        </Link>
      </StyledIconContainer>
      <StyledMenuItemContainer>
        <StyledMenuItem onClick={() => setShowHomeowners(!showHomeowners)}>
          Homeowners
        </StyledMenuItem>
        {showHomeowners && (
          <>
            <StyledSubMenuItemContainer>
              <Link href={"/homeowners/add"} inverseColors={true}>
                <StyledMenuItem>Add Homeowner</StyledMenuItem>
              </Link>
            </StyledSubMenuItemContainer>
            <StyledSubMenuItemContainer>
              <Link href={"/homeowners/remove"} inverseColors={true}>
                <StyledMenuItem>Remove Homeowner</StyledMenuItem>
              </Link>
            </StyledSubMenuItemContainer>
          </>
        )}
      </StyledMenuItemContainer>

      <StyledMenuItemContainer>
        <StyledMenuItem onClick={() => setShowProperties(!showProperties)}>
          Properties
        </StyledMenuItem>
        {showProperties && (
          <>
            <StyledSubMenuItemContainer>
              <Link href={"/properties/view"} inverseColors={true}>
                <StyledMenuItem>View All</StyledMenuItem>
              </Link>
            </StyledSubMenuItemContainer>
            <StyledSubMenuItemContainer>
              <Link href={"/properties/add"} inverseColors={true}>
                <StyledMenuItem>Add Property</StyledMenuItem>
              </Link>
            </StyledSubMenuItemContainer>
            <StyledSubMenuItemContainer>
              <Link href={"/properties/remove"} inverseColors={true}>
                <StyledMenuItem>Remove Property</StyledMenuItem>
              </Link>
            </StyledSubMenuItemContainer>
          </>
        )}
      </StyledMenuItemContainer>
    </StyledSideBarContainer>
  );
};

export default SidebarMenu;
