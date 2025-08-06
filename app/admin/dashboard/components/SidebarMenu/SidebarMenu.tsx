"use client";

import {
  StyledIconContainer,
  StyledMenuItem,
  StyledMenuItemContainer,
  StyledSideBarContainer,
  StyledSubMenuItemContainer,
  StyledTopBarToggleContainer
} from "./SidebarMenuStyle";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { HamburgerIcon } from "../../../../components/HamburgerIcon/HamburgerIcon";
import { isDesktopHook, isMobileHook, isTabletHook } from "../../../../components/hooks/useMediaQuery";

const SidebarMenu = () => {
  const [isMenuExpandedForMobile, setIsMenuExpandedForMobile] = useState<boolean>(false);
  const [showHomeowners, setShowHomeowners] = useState<boolean>(false);
  const [showProperties, setShowProperties] = useState<boolean>(false);
  const [showUsage, setShowUsage] = useState<boolean>(false);
  const [showInvoices, setShowInvoices] = useState<boolean>(false);
  const [showPayments, setShowPayments] = useState<boolean>(false);

  const isMobile = isMobileHook();
  const isTablet = isTabletHook();
  const isDesktop = isDesktopHook();

  console.log(isDesktop);

  const renderMenuItems = () => (
    <StyledSideBarContainer>
      <StyledIconContainer>
        <Link href={"/admin/dashboard"}>
          <Image src="/water-well.png" height={75} width={75} alt={"Well Icon"} />
        </Link>
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
              <Link href={"/admin/dashboard/usages/addSingle"}>Add Individually</Link>
            </StyledSubMenuItemContainer>
          </>
        )}
      </StyledMenuItemContainer>

      <StyledMenuItemContainer>
        <StyledMenuItem onClick={() => setShowInvoices(!showInvoices)}>Invoices</StyledMenuItem>
        {showInvoices && (
          <>
            <StyledSubMenuItemContainer>
              <Link href={"/admin/dashboard/invoices/all"}>View All Invoices</Link>
            </StyledSubMenuItemContainer>
            <StyledSubMenuItemContainer>
              <Link href={"/admin/dashboard/invoices/add"}>Generate Monthly Invoices</Link>
            </StyledSubMenuItemContainer>
          </>
        )}
      </StyledMenuItemContainer>

      <StyledMenuItemContainer>
        <StyledMenuItem onClick={() => setShowPayments(!showPayments)}>Payments</StyledMenuItem>
        {showPayments && (
          <>
            <StyledSubMenuItemContainer>
              <Link href={"/admin/dashboard/payments/all"}>View All</Link>
            </StyledSubMenuItemContainer>
            <StyledSubMenuItemContainer>
              <Link href={"/admin/dashboard/payments/add"}>Add Payment</Link>
            </StyledSubMenuItemContainer>
          </>
        )}
      </StyledMenuItemContainer>
    </StyledSideBarContainer>
  );

  const renderMobileMenu = () => {
    return (
      <>
        <StyledTopBarToggleContainer>
          <HamburgerIcon
            isOpen={isMenuExpandedForMobile}
            onClick={() => setIsMenuExpandedForMobile(!isMenuExpandedForMobile)}
            size={40}
            color="#000"
          />
        </StyledTopBarToggleContainer>
        {isMenuExpandedForMobile && renderMenuItems()}
      </>
    );
  };

  const renderDesktopMenu = () => {
    return <>{renderMenuItems()}</>;
  };

  return (
    <>
      {isMobile && renderMobileMenu()}
      {isTablet && renderDesktopMenu()}
      {isDesktop && renderDesktopMenu()}
    </>
  );
};

export default SidebarMenu;
