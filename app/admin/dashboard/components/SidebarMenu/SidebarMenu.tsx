"use client";

import {
  StyledIconContainer,
  StyledMenuItem,
  StyledMenuItemContainer,
  StyledSideBarContainer,
  StyledSubMenuItemContainer
} from "./SidebarMenuStyle";
import { useState } from "react";
import Link from "next/link";

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
              <Link href={"/admin/dashboard/homeowners/all"}>View All</Link>
            </StyledSubMenuItemContainer>
            <StyledSubMenuItemContainer>
              <Link href={"/admin/dashboard/homeowners/add"}>Add Homeowner</Link>
            </StyledSubMenuItemContainer>
          </>
        )}
      </StyledMenuItemContainer>

      <StyledMenuItemContainer>
        <StyledMenuItem onClick={() => setShowProperties(!showProperties)}>Properties</StyledMenuItem>
        {showProperties && (
          <>
            <StyledSubMenuItemContainer>
              <Link href={"/admin/dashboard/properties/all"}>View All</Link>
            </StyledSubMenuItemContainer>
            <StyledSubMenuItemContainer>
              <Link href={"/admin/dashboard/properties/add"}>Add Property</Link>
            </StyledSubMenuItemContainer>
          </>
        )}
      </StyledMenuItemContainer>

      <StyledMenuItemContainer>
        <StyledMenuItem onClick={() => setShowUsage(!showUsage)}>Usages</StyledMenuItem>
        {showUsage && (
          <>
            <StyledSubMenuItemContainer>
              <Link href={"/admin/dashboard/usages/all"}>View All</Link>
            </StyledSubMenuItemContainer>
            <StyledSubMenuItemContainer>
              <Link href={"/admin/dashboard/usages/add"}>Add Usage</Link>
            </StyledSubMenuItemContainer>
            <StyledSubMenuItemContainer>
              <Link href={"/admin/dashboard/usages/add"}>Add By order</Link>
            </StyledSubMenuItemContainer>
            <StyledSubMenuItemContainer>
              <Link href={"/admin/dashboard/bills/view"}>View All Bills</Link>
            </StyledSubMenuItemContainer>
            <StyledSubMenuItemContainer>
              <Link href={"/admin/dashboard/bills/add"}>Generate Monthly Bills</Link>
            </StyledSubMenuItemContainer>
          </>
        )}
      </StyledMenuItemContainer>

      <StyledMenuItemContainer>
        <StyledMenuItem onClick={() => setShowPayments(!showPayments)}>Account Balances</StyledMenuItem>
        {showPayments && (
          <>
            <StyledSubMenuItemContainer>
              <Link href={"/admin/dashboard/balances/all"}>View All</Link>
            </StyledSubMenuItemContainer>
            <StyledSubMenuItemContainer>
              <Link href={"/admin/dashboard/payments/add"}>Add Payment</Link>
            </StyledSubMenuItemContainer>
          </>
        )}
      </StyledMenuItemContainer>
    </StyledSideBarContainer>
  );
};

export default SidebarMenu;
