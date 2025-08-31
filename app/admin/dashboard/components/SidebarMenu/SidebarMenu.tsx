"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { HamburgerIcon } from "../../../../components/HamburgerIcon/HamburgerIcon";
import { useIsDesktopHook, useIsMobileHook, useIsTabletHook } from "../../../../components/hooks/useMediaQuery";
import { Button } from "../../../../components/Button/Button";

const SidebarMenu = () => {
  const [isMenuExpandedForMobile, setIsMenuExpandedForMobile] = useState<boolean>(false);
  const [showHomeowners, setShowHomeowners] = useState<boolean>(false);
  const [showProperties, setShowProperties] = useState<boolean>(false);
  const [showUsage, setShowUsage] = useState<boolean>(false);
  const [showInvoices, setShowInvoices] = useState<boolean>(false);
  const [showPayments, setShowPayments] = useState<boolean>(false);
  const router = useRouter();

  const isMobile = useIsMobileHook();
  const isTablet = useIsTabletHook();
  const isDesktop = useIsDesktopHook();

  const handleMobileClick = () => {
    if (isMobile || isTablet) {
      setIsMenuExpandedForMobile(false);
      setShowHomeowners(false);
      setShowProperties(false);
      setShowUsage(false);
      setShowInvoices(false);
      setShowPayments(false);
    }
  };

  const handleLogoutClick = async () => {
    try {
      const resp = await fetch("/api/account/logout", {
        method: "POST",
        credentials: "include" // ensure cookies are sent
      });

      if (!resp.ok) {
        const err = await resp.text();
        console.error("Logout failed:", err);
        alert("Could not log out – please try again.");

        return;
      }

      // Successful logout → navigate to login page
      router.replace("/account/login");
    } catch (e) {
      console.error("Network error during logout", e);
      alert("Network error – please try again.");
    } finally {
    }
  };

  const renderMenuItems = () => (
    <div className="flex flex-col w-full max-w-full bg-white shadow-lg print:!hidden">
      <div className="hidden sm:flex flex-row justify-center justify-items-center w-full mt-[10px] mb-[10px]">
        <Link href={"/admin/dashboard"}>
          <Image src="/water-well.png" height={75} width={75} alt={"Well Icon"} />
        </Link>
      </div>
      <div className="pl-0">
        <div className="p-[15px] border-b border-[rgb(237,241,247)] select-none hover:cursor-pointer hover:text-blue-600">
          <Link href={"/admin/dashboard"} onClick={() => handleMobileClick()}>
            Dashboard
          </Link>
        </div>
      </div>
      <div className="pl-0">
        <div
          className="p-[15px] border-b border-[rgb(237,241,247)] select-none hover:cursor-pointer hover:text-blue-600"
          onClick={() => setShowHomeowners(!showHomeowners)}
        >
          Members
        </div>
        {showHomeowners && (
          <>
            <div
              className={
                "list-none pl-[15px] border-b border-[rgb(237,241,247)] flex flex-row [&>a]:no-underline [&>a]:text-gray-800 [&>a]:w-full [&>a]:p-[15px] [&>a:hover]:cursor-pointer [&>a:hover]:text-blue-600"
              }
            >
              <Link href={"/admin/dashboard/homeowners/all"} onClick={() => handleMobileClick()}>
                View All
              </Link>
            </div>
            <div
              className={
                "list-none pl-[15px] border-b border-[rgb(237,241,247)] flex flex-row [&>a]:no-underline [&>a]:text-gray-800 [&>a]:w-full [&>a]:p-[15px] [&>a:hover]:cursor-pointer [&>a:hover]:text-blue-600"
              }
            >
              <Link href={"/admin/dashboard/homeowners/add"} onClick={() => handleMobileClick()}>
                Add Member
              </Link>
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
              <Link href={"/admin/dashboard/properties/all"} onClick={() => handleMobileClick()}>
                View All
              </Link>
            </div>
            <div
              className={
                "list-none pl-[15px] border-b border-[rgb(237,241,247)] flex flex-row [&>a]:no-underline [&>a]:text-gray-800 [&>a]:w-full [&>a]:p-[15px] [&>a:hover]:cursor-pointer [&>a:hover]:text-blue-600"
              }
            >
              <Link href={"/admin/dashboard/properties/add"} onClick={() => handleMobileClick()}>
                Add Property
              </Link>
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
              <Link href={"/admin/dashboard/usages/all"} onClick={() => handleMobileClick()}>
                View All
              </Link>
            </div>
            <div
              className={
                "list-none pl-[15px] border-b border-[rgb(237,241,247)] flex flex-row [&>a]:no-underline [&>a]:text-gray-800 [&>a]:w-full [&>a]:p-[15px] [&>a:hover]:cursor-pointer [&>a:hover]:text-blue-600"
              }
            >
              <Link href={"/admin/dashboard/usages/add"} onClick={() => handleMobileClick()}>
                Add Usage
              </Link>
            </div>
            <div
              className={
                "list-none pl-[15px] border-b border-[rgb(237,241,247)] flex flex-row [&>a]:no-underline [&>a]:text-gray-800 [&>a]:w-full [&>a]:p-[15px] [&>a:hover]:cursor-pointer [&>a:hover]:text-blue-600"
              }
            >
              <Link href={"/admin/dashboard/usages/addSingle"} onClick={() => handleMobileClick()}>
                Add Individually
              </Link>
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
              <Link href={"/admin/dashboard/invoices/all"} onClick={() => handleMobileClick()}>
                View All Invoices
              </Link>
            </div>
            <div
              className={
                "list-none pl-[15px] border-b border-[rgb(237,241,247)] flex flex-row [&>a]:no-underline [&>a]:text-gray-800 [&>a]:w-full [&>a]:p-[15px] [&>a:hover]:cursor-pointer [&>a:hover]:text-blue-600"
              }
            >
              <Link href={"/admin/dashboard/invoices/add"} onClick={() => handleMobileClick()}>
                Generate Monthly Invoices
              </Link>
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
              <Link href={"/admin/dashboard/payments/all"} onClick={() => handleMobileClick()}>
                View All
              </Link>
            </div>
            <div
              className={
                "list-none pl-[15px] border-b border-[rgb(237,241,247)] flex flex-row [&>a]:no-underline [&>a]:text-gray-800 [&>a]:w-full [&>a]:p-[15px] [&>a:hover]:cursor-pointer [&>a:hover]:text-blue-600"
              }
            >
              <Link href={"/admin/dashboard/payments/add"} onClick={() => handleMobileClick()}>
                Add Payment
              </Link>
            </div>
          </>
        )}
      </div>
      <div className="pl-0">
        <div className="p-[15px] border-b border-[rgb(237,241,247)] select-none hover:cursor-pointer hover:text-blue-600">
          <Button onClick={() => handleLogoutClick()} displayType={"outline"}>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );

  const renderMobileMenu = () => {
    return (
      <>
        <div className="flex flex-row justify-end w-full max-w-full bg-white shadow-lg border-b border-gray-400 print:!hidden">
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
    return <div className={"sm:hidden md:hidden lg:flex w-[350px]"}>{renderMenuItems()}</div>;
  };

  const renderAppropriateMenu = (isMobile: boolean, isTablet: boolean, isDesktop: boolean) => {
    if (isDesktop) return renderDesktopMenu();
    else if (isTablet) return renderMobileMenu();
    else if (isMobile) return renderMobileMenu();
  };

  return <>{renderAppropriateMenu(isMobile, isTablet, isDesktop)}</>;
};

export { SidebarMenu };
