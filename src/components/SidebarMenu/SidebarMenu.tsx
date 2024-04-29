import { Link } from "../Link/Link";
import {
  StyledIconContainer,
  StyledMenuItem,
  StyledMenuItemContainer,
  StyledSideBarContainer,
  StyledSubMenuItemContainer,
} from "./SidebarMenuStyle";
import { useState } from "react";

interface SidebarMenuProps {
  onMenuItemClick: (item: string) => void;
}

const SidebarMenu = (props: SidebarMenuProps) => {
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
              <StyledMenuItem
                onClick={() => props.onMenuItemClick("add_homeowner")}
              >
                Add Homeowner
              </StyledMenuItem>
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
              <StyledMenuItem
                onClick={() => props.onMenuItemClick("view_property")}
              >
                View All
              </StyledMenuItem>
            </StyledSubMenuItemContainer>
            <StyledSubMenuItemContainer>
              <StyledMenuItem
                onClick={() => props.onMenuItemClick("add_property")}
              >
                Add Property
              </StyledMenuItem>
            </StyledSubMenuItemContainer>
          </>
        )}
      </StyledMenuItemContainer>
    </StyledSideBarContainer>
  );
};

export default SidebarMenu;
