import { Link } from "../Link/Link";
import {
  StyledIconContainer,
  StyledMenuItem,
  StyledMenuItemContainer,
  StyledSideBarContainer,
  StyledSubMenuItemContainer
} from "./SidebarMenuStyle";
import { useState } from "react";

interface SidebarMenuProps {
  onMenuItemClick: (item: string) => void;
}

const SidebarMenu = (props: SidebarMenuProps) => {
  const [showHomeowners, setShowHomeowners] = useState<boolean>(false);
  const [showProperties, setShowProperties] = useState<boolean>(false);
  const [showUsage, setShowUsage] = useState<boolean>(false);
  const [showPayments, setShowPayments] = useState<boolean>(false);

  return (
    <StyledSideBarContainer>
      <StyledIconContainer>
        <img
          src={"/water-well.png"}
          style={{ height: "75px" }}
          alt={"Well Icon"}
          onClick={() => props.onMenuItemClick("home")}
        />
      </StyledIconContainer>
      <StyledMenuItemContainer>
        <StyledMenuItem onClick={() => setShowHomeowners(!showHomeowners)}>Homeowners</StyledMenuItem>
        {showHomeowners && (
          <>
            <StyledSubMenuItemContainer>
              <StyledMenuItem onClick={() => props.onMenuItemClick("view_homeowner")}>View All</StyledMenuItem>
            </StyledSubMenuItemContainer>
            <StyledSubMenuItemContainer>
              <StyledMenuItem onClick={() => props.onMenuItemClick("add_homeowner")}>Add Homeowner</StyledMenuItem>
            </StyledSubMenuItemContainer>
          </>
        )}
      </StyledMenuItemContainer>

      <StyledMenuItemContainer>
        <StyledMenuItem onClick={() => setShowProperties(!showProperties)}>Properties</StyledMenuItem>
        {showProperties && (
          <>
            <StyledSubMenuItemContainer>
              <StyledMenuItem onClick={() => props.onMenuItemClick("view_property")}>View All</StyledMenuItem>
            </StyledSubMenuItemContainer>
            <StyledSubMenuItemContainer>
              <StyledMenuItem onClick={() => props.onMenuItemClick("add_property")}>Add Property</StyledMenuItem>
            </StyledSubMenuItemContainer>
          </>
        )}
      </StyledMenuItemContainer>

      <StyledMenuItemContainer>
        <StyledMenuItem onClick={() => setShowUsage(!showUsage)}>Usages</StyledMenuItem>
        {showUsage && (
          <>
            <StyledSubMenuItemContainer>
              <StyledMenuItem onClick={() => props.onMenuItemClick("view_usage")}>View All</StyledMenuItem>
            </StyledSubMenuItemContainer>
            <StyledSubMenuItemContainer>
              <StyledMenuItem onClick={() => props.onMenuItemClick("add_usage_by_homeowner")}>
                Add Usage By Homeowner
              </StyledMenuItem>
            </StyledSubMenuItemContainer>
            <StyledSubMenuItemContainer>
              <StyledMenuItem onClick={() => props.onMenuItemClick("add_usage_by_order")}>
                Add Usage By Order (WIP)
              </StyledMenuItem>
            </StyledSubMenuItemContainer>
          </>
        )}
      </StyledMenuItemContainer>

      <StyledMenuItemContainer>
        <StyledMenuItem onClick={() => setShowPayments(!showPayments)}>Payments</StyledMenuItem>
        {showPayments && (
          <>
            <StyledSubMenuItemContainer>
              <StyledMenuItem onClick={() => props.onMenuItemClick("view_payments")}>View All</StyledMenuItem>
            </StyledSubMenuItemContainer>
            <StyledSubMenuItemContainer>
              <StyledMenuItem onClick={() => props.onMenuItemClick("add_payment")}>
                Add Payment By Homeowner
              </StyledMenuItem>
            </StyledSubMenuItemContainer>
          </>
        )}
      </StyledMenuItemContainer>
    </StyledSideBarContainer>
  );
};

export default SidebarMenu;
