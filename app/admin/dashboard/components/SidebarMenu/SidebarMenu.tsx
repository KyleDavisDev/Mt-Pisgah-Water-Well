"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { HamburgerIcon } from "../../../../components/HamburgerIcon/HamburgerIcon";
import { useIsDesktopHook, useIsMobileHook, useIsTabletHook } from "../../../../components/hooks/useMediaQuery";

const SidebarMenu = () => {
  const [isMenuExpandedForMobile, setIsMenuExpandedForMobile] = useState<boolean>(false);
  const [showHomeowners, setShowHomeowners] = useState<boolean>(false);
  const [showProperties, setShowProperties] = useState<boolean>(false);
  const [showUsage, setShowUsage] = useState<boolean>(false);
  const [showInvoices, setShowInvoices] = useState<boolean>(false);
  const [showPayments, setShowPayments] = useState<boolean>(false);

  const isMobile = useIsMobileHook();
  const isTablet = useIsTabletHook();
  const isDesktop = useIsDesktopHook();

  const renderMenuItems = () => (
    <div className="flex flex-col w-full max-w-full bg-white shadow-lg print:!hidden sm:max-w-[300px] md:w-full">
      <div className="hidden sm:flex flex-row justify-center justify-items-center w-full">
        <Link href={"/admin/dashboard"}>
          <Image src="/water-well.png" height={75} width={75} alt={"Well Icon"} />
        </Link>
      </div>
      <div className="pl-0">
        <div
          className="p-[15px] border-b border-[rgb(237,241,247)] select-none hover:cursor-pointer hover:text-blue-600"
          onClick={() => setShowHomeowners(!showHomeowners)}
        >
          Homeowners
        </div>
        {showHomeowners && (
          <>
            <div
              className={
                "list-none pl-[15px] border-b border-[rgb(237,241,247)] flex flex-row [&>a]:no-underline [&>a]:text-gray-800 [&>a]:w-full [&>a]:p-[15px] [&>a:hover]:cursor-pointer [&>a:hover]:text-blue-600"
              }
            >
              <Link href={"/admin/dashboard/homeowners/all"}>View All</Link>
            </div>
            <div
              className={
                "list-none pl-[15px] border-b border-[rgb(237,241,247)] flex flex-row [&>a]:no-underline [&>a]:text-gray-800 [&>a]:w-full [&>a]:p-[15px] [&>a:hover]:cursor-pointer [&>a:hover]:text-blue-600"
              }
            >
              <Link href={"/admin/dashboard/homeowners/add"}>Add Homeowner</Link>
            </div>
          </>
        )}
      </div>

      <div className="pl-0">
        <div
          className="p-[15px] border-b border-[rgb(237,241,247)] select-none hover:cursor-pointer hover:text-blue-600"
          onClick={() => setShowProperties(!showProperties)}
        >
          Properties
        </div>
        {showProperties && (
          <>
            <div
              className={
                "list-none pl-[15px] border-b border-[rgb(237,241,247)] flex flex-row [&>a]:no-underline [&>a]:text-gray-800 [&>a]:w-full [&>a]:p-[15px] [&>a:hover]:cursor-pointer [&>a:hover]:text-blue-600"
              }
            >
              <Link href={"/admin/dashboard/properties/all"}>View All</Link>
            </div>
            <div
              className={
                "list-none pl-[15px] border-b border-[rgb(237,241,247)] flex flex-row [&>a]:no-underline [&>a]:text-gray-800 [&>a]:w-full [&>a]:p-[15px] [&>a:hover]:cursor-pointer [&>a:hover]:text-blue-600"
              }
            >
              <Link href={"/admin/dashboard/properties/add"}>Add Property</Link>
            </div>
          </>
        )}
      </div>

      <div className="pl-0">
        <div
          className="p-[15px] border-b border-[rgb(237,241,247)] select-none hover:cursor-pointer hover:text-blue-600"
          onClick={() => setShowUsage(!showUsage)}
        >
          Usages
        </div>
        {showUsage && (
          <>
            <div
              className={
                "list-none pl-[15px] border-b border-[rgb(237,241,247)] flex flex-row [&>a]:no-underline [&>a]:text-gray-800 [&>a]:w-full [&>a]:p-[15px] [&>a:hover]:cursor-pointer [&>a:hover]:text-blue-600"
              }
            >
              <Link href={"/admin/dashboard/usages/all"}>View All</Link>
            </div>
            <div
              className={
                "list-none pl-[15px] border-b border-[rgb(237,241,247)] flex flex-row [&>a]:no-underline [&>a]:text-gray-800 [&>a]:w-full [&>a]:p-[15px] [&>a:hover]:cursor-pointer [&>a:hover]:text-blue-600"
              }
            >
              <Link href={"/admin/dashboard/usages/add"}>Add Usage</Link>
            </div>
            <div
              className={
                "list-none pl-[15px] border-b border-[rgb(237,241,247)] flex flex-row [&>a]:no-underline [&>a]:text-gray-800 [&>a]:w-full [&>a]:p-[15px] [&>a:hover]:cursor-pointer [&>a:hover]:text-blue-600"
              }
            >
              <Link href={"/admin/dashboard/usages/addSingle"}>Add Individually</Link>
            </div>
          </>
        )}
      </div>

      <div className="pl-0">
        <div
          className="p-[15px] border-b border-[rgb(237,241,247)] select-none hover:cursor-pointer hover:text-blue-600"
          onClick={() => setShowInvoices(!showInvoices)}
        >
          Invoices
        </div>
        {showInvoices && (
          <>
            <div
              className={
                "list-none pl-[15px] border-b border-[rgb(237,241,247)] flex flex-row [&>a]:no-underline [&>a]:text-gray-800 [&>a]:w-full [&>a]:p-[15px] [&>a:hover]:cursor-pointer [&>a:hover]:text-blue-600"
              }
            >
              <Link href={"/admin/dashboard/invoices/all"}>View All Invoices</Link>
            </div>
            <div
              className={
                "list-none pl-[15px] border-b border-[rgb(237,241,247)] flex flex-row [&>a]:no-underline [&>a]:text-gray-800 [&>a]:w-full [&>a]:p-[15px] [&>a:hover]:cursor-pointer [&>a:hover]:text-blue-600"
              }
            >
              <Link href={"/admin/dashboard/invoices/add"}>Generate Monthly Invoices</Link>
            </div>
          </>
        )}
      </div>

      <div className="pl-0">
        <div
          className="p-[15px] border-b border-[rgb(237,241,247)] select-none hover:cursor-pointer hover:text-blue-600"
          onClick={() => setShowPayments(!showPayments)}
        >
          Payments
        </div>
        {showPayments && (
          <>
            <div
              className={
                "list-none pl-[15px] border-b border-[rgb(237,241,247)] flex flex-row [&>a]:no-underline [&>a]:text-gray-800 [&>a]:w-full [&>a]:p-[15px] [&>a:hover]:cursor-pointer [&>a:hover]:text-blue-600"
              }
            >
              <Link href={"/admin/dashboard/payments/all"}>View All</Link>
            </div>
            <div
              className={
                "list-none pl-[15px] border-b border-[rgb(237,241,247)] flex flex-row [&>a]:no-underline [&>a]:text-gray-800 [&>a]:w-full [&>a]:p-[15px] [&>a:hover]:cursor-pointer [&>a:hover]:text-blue-600"
              }
            >
              <Link href={"/admin/dashboard/payments/add"}>Add Payment</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderMobileMenu = () => {
    return (
      <>
        <div className="flex flex-row justify-end w-full max-w-full bg-white shadow-lg border-b border-gray-400 print:!hidden sm:hidden">
          <HamburgerIcon
            isOpen={isMenuExpandedForMobile}
            onClick={() => setIsMenuExpandedForMobile(!isMenuExpandedForMobile)}
            size={30}
            color="#000"
          />
        </div>
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
