"use client";

import React from "react";
import { InvoiceDetailsMapper } from "./utils/invoiceDetailsMapper";
import { InvoiceDetails, invoiceDTO, historicalUsageDTO, homeownerDTO, propertyDTO } from "./types";
import { formatPenniesToDollars, getMonthStrFromMonthIndex } from "../../../util";
import Image from "next/image";

export default function BillView({ params }: { params: { id: string } }) {
  const [bill, setBill] = React.useState<invoiceDTO | null>(null);
  const [homeowner, setHomeowner] = React.useState<homeownerDTO | null>(null);
  const [property, setProperty] = React.useState<propertyDTO | null>(null);
  const [historicalUsage, setHistoricalUsage] = React.useState<historicalUsageDTO[] | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchInvoiceById = async () => {
      try {
        const response = await fetch(`/api/invoices/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch bill");
        }
        const data = await response.json();
        setBill(data.bill);
        setHomeowner(data.homeowner);
        setProperty(data.property);
        setHistoricalUsage(data.historicalUsage);
      } catch (err) {
        setError("Failed to load bill details");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoiceById();
  }, [params.id]);

  React.useEffect(() => {
    if (bill && !isLoading && !error) {
      // window.print();
    }
  }, [bill, isLoading, error]);

  if (isLoading) {
    return (
      <div
        className={
          "shadow-lg p-10 min-w-[900px] min-h-[11in] mx-auto my-6 bg-white text-black font-sans leading-[1.4] box-border print:w-full print:min-h-screen print:shadow-none"
        }
      >
        Loading bill details...
      </div>
    );
  }

  if (error || !bill || !homeowner || !property || !historicalUsage) {
    return (
      <div
        className={
          "shadow-lg p-10 min-w-[900px] min-h-[11in] mx-auto my-6 bg-white text-black font-sans leading-[1.4] box-border print:w-full print:min-h-screen print:shadow-none"
        }
      >
        Error loading bill: {error}
      </div>
    );
  }

  const billDetails: InvoiceDetails = InvoiceDetailsMapper(bill, homeowner, property, historicalUsage);

  return (
    <div
      className={
        "shadow-lg p-10 min-w-[900px] min-h-[11in] mx-auto my-6 bg-white text-black font-sans leading-[1.4] box-border print:w-full print:min-h-screen print:shadow-none"
      }
    >
      <div className={"flex flex-row justify-between"}>
        <div className={"[&_p]:mt-[4px] [&_p]:mb-[4px] [&_p]:mr-0 [&_p]:ml-0 [&_p]:text-[14px]"}>
          <div className={"flex flex-row items-center justify-start mb-[15px]"}>
            <Image className={"mr-[10px]"} src="/water-well.png" height={40} width={40} alt={"Well Icon"} />
            <h2 className={"text-[20px] font-bold"}>{billDetails.waterCompany.name}</h2>
          </div>
          <p>{billDetails.waterCompany.address}</p>
          <p>
            {billDetails.waterCompany.city}, {billDetails.waterCompany.state} {billDetails.waterCompany.zip}
          </p>
          <p>Phone: {billDetails.waterCompany.phone}</p>
          {billDetails.waterCompany.fax && <p>Fax: {billDetails.waterCompany.fax}</p>}
          <p>Email: {billDetails.waterCompany.email}</p>
        </div>
        <div className={"text-right text-[14px]"}>
          <p>Invoice Created On: {billDetails.createdDate}</p>
          <p>Invoice Number: {billDetails.id}</p>
        </div>
      </div>

      <div>
        <div className={"[&_p]:mt-[4px] [&_p]:mb-[4px] [&_p]:mr-0 [&_p]:ml-0 [&_p]:text-[14px]"}>
          <p>{billDetails.homeowner.name}</p>
          <p>{billDetails.property.street}</p>
          <p>
            {billDetails.property.city}, {billDetails.property.state} {billDetails.property.zip}
          </p>
        </div>
      </div>

      <div className={"bg-[#f8f8f8] p-[20px] rounded-sm mt-6 mb-6"}>
        <div className={"flex flex-row items-center"}>
          <div className={"flex-1 text-center"}>
            <h5 className={"text-[14px] mb-[8px] text-[#666666]"}>Month</h5>
            <p className={"text-[18px] m-0 font-bold"}>{billDetails.billingPeriod}</p>
          </div>
          <div className={"flex-1 text-center"}>
            <h5 className={"text-[14px] mb-[8px] text-[#666666]"}>Gallons Used</h5>
            <p className={"text-[18px] m-0 font-bold"}>{billDetails.currentUsage.usage.toLocaleString()}</p>
          </div>
          <div className={"flex-1 text-center"}>
            <h5 className={"text-[14px] mb-[8px] text-[#666666]"}>Amount Due</h5>
            <p className={"text-[18px] m-0 font-bold"}>{billDetails.bill.totalAmount}</p>
          </div>
        </div>
      </div>

      <div className={"flex flex-row items-start mt-[30px] mb-[30px]"}>
        <div className={"w-full mr-[20px]"}>
          <h4 className={"text-[16px] mr-[15px] font-bold"}>This Month</h4>
          <div>
            <div className={"flex flex-wrap items-start justify-between pt-[8px] pb-[8px] border-b border-tableBorder"}>
              <span>Base Charge ({billDetails.bill.formula.baseGallons}):</span>
              <span>{billDetails.bill.baseCharge}</span>
            </div>
            <div className={"flex flex-wrap items-start justify-between pt-[8px] pb-[8px] border-b border-tableBorder"}>
              <span>Excess Charge:</span>
              <span>${billDetails.bill.excessUsageCharge.toFixed(2)}</span>
            </div>
            <div className={"flex flex-wrap items-start justify-between pt-[8px] pb-[8px] border-b border-tableBorder"}>
              <span>Late Fee:</span>
              <span>${billDetails.bill.lateFee.toFixed(2)}</span>
            </div>
            <div className={"flex flex-wrap items-start justify-between pt-[8px] pb-[8px] border-b border-tableBorder"}>
              <span>Other Charges:</span>
              <span>${billDetails.bill.otherCharges.toFixed(2)}</span>
            </div>
            <div className={"flex flex-wrap items-start justify-between pt-[8px] pb-[8px]"}>
              <span>Amount Outstanding:</span>
              <span>${billDetails.bill.amountOutstanding.toFixed(2)}</span>
            </div>
            <div
              className={
                "flex flex-wrap items-start justify-between border-b-[2px] border-t-[2px] border-black font-bold pt-[12px] pb-[12px] mt-[8px]"
              }
            >
              <span>Total amount owing:</span>
              <span>{billDetails.bill.totalAmount}</span>
            </div>
          </div>
        </div>

        <div className={"w-full ml-[20px]"}>
          <h4 className={"text-[16px] mr-[15px] font-bold"}>Previous Monthly Usages</h4>
          <table className={"w-full border-collapse text-[14px]"}>
            <thead>
              <tr>
                <th className={"p-[8px] text-left border border-tableBorder font-bold"}>Month</th>
                <th className={"p-[8px] text-right border border-tableBorder font-bold"}>Usage</th>
                <th className={"p-[8px] text-right border border-tableBorder font-bold"}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {billDetails.monthlyUsageHistory.map((monthlyUsage, index) => (
                <tr className={`${index % 2 === 0 ? "bg-[#fafafa]" : ""}`} key={monthlyUsage.month}>
                  <td className={"p-[8px] text-left border border-tableBorder"}>
                    {getMonthStrFromMonthIndex(monthlyUsage.month)}
                  </td>
                  <td className={"p-[8px] text-right border border-tableBorder"}>{monthlyUsage.gallonsUsed}</td>
                  <td className={"p-[8px] text-right border border-tableBorder"}>
                    {formatPenniesToDollars(monthlyUsage.amountInPennies)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
