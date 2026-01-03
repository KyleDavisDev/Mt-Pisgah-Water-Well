import React from "react";
import {
  formatISODateToUserFriendlyLocal,
  formatNumberWithCommas,
  formatPenniesToDollars,
  getMonthStrFromMonthIndex
} from "../../util";
import { BillDetails } from "../../../../api/bills/types/types";

export interface BillViewContentProps {
  billDetails: BillDetails;
}

export default function BillViewContent({ billDetails }: BillViewContentProps) {
  return (
    <div
      className={
        "shadow-lg p-10 min-w-[900px] min-h-[11in] mx-auto my-6 bg-white text-black font-sans leading-[1.4] box-border print:w-full print:min-h-screen print:shadow-none"
      }
    >
      <div className={"flex flex-row justify-between"}>
        <div className={"[&_p]:mt-[4px] [&_p]:mb-[4px] [&_p]:mr-0 [&_p]:ml-0 [&_p]:text-[14px]"}>
          <div className={"flex flex-row items-center justify-start mb-[15px]"}>
            <img className="mr-[10px]" src="/water-well.png" height={40} width={40} alt="Well Icon" />
            <h2 className={"text-[20px] font-bold"}>{billDetails.company.name}</h2>
          </div>
          <p className={"m-0"}>{billDetails.homeowner.name}</p>
          <p className={"m-0"}>{billDetails.property.street}</p>
          <p className={"m-0"}>
            {billDetails.property.city}, {billDetails.property.state} {billDetails.property.zip}
          </p>
        </div>
        <div className={"text-right text-[14px]"}>
          <p>Invoice Created On: {formatISODateToUserFriendlyLocal(billDetails.createdDate)}</p>
          <p className={"mb-[15px]"}>Invoice Number: {billDetails.id}</p>
          <p>{billDetails.company.address}</p>
          <p>
            {billDetails.company.city}, {billDetails.company.state} {billDetails.company.zip}
          </p>
          <p>Phone: {billDetails.company.phone}</p>
          {billDetails.company.fax && <p>Fax: {billDetails.company.fax}</p>}
          <p>Email: {billDetails.company.email}</p>
        </div>
      </div>

      <div>
        <div className={"[&_p]:mt-[4px] [&_p]:mb-[4px] [&_p]:mr-0 [&_p]:ml-0 [&_p]:text-[14px]"}></div>
      </div>

      <div className={"bg-[#dfdfdf] p-[20px] rounded-sm mt-6 mb-6"}>
        <div className={"flex flex-row items-center"}>
          <div className={"flex-1 text-center"}>
            <h5 className={"text-[14px] mb-[8px] text-[#666666]"}>Month</h5>
            <p className={"text-[18px] m-0 font-bold"}>
              {`${getMonthStrFromMonthIndex(billDetails.billingPeriod.billingMonth)} ${billDetails.billingPeriod.billingYear}`}
            </p>
          </div>
          <div className={"flex-1 text-center"}>
            <h5 className={"text-[14px] mb-[8px] text-[#666666]"}>Gallons Used</h5>
            <p className={"text-[18px] m-0 font-bold"}>{formatNumberWithCommas(billDetails.currentUsage.usage)}</p>
          </div>
          <div className={"flex-1 text-center"}>
            <h5 className={"text-[14px] mb-[8px] text-[#666666]"}>Amount Due</h5>
            <p className={"text-[18px] m-0 font-bold"}>
              {formatPenniesToDollars(billDetails.bill.amountOwingInPennies)}
            </p>
          </div>
        </div>
      </div>

      <div className={"flex flex-row items-start mt-[30px] mb-[30px]"}>
        <div className={"w-full mr-[20px]"}>
          <h4 className={"text-[16px] mr-[15px] font-bold"}>This Month</h4>
          <div>
            <div className={"flex flex-wrap items-start justify-between pt-[8px] pb-[8px] border-b border-tableBorder"}>
              <span>Base Charge ({formatNumberWithCommas(billDetails.bill.formula.baseGallons)} gal):</span>
              <span>{formatPenniesToDollars(billDetails.bill.baseCharge)}</span>
            </div>
            <div className={"flex flex-wrap items-start justify-between pt-[8px] pb-[8px] border-b border-tableBorder"}>
              <span>Excess Charge ({`${billDetails.bill.formula.usageRateInPennies * 5}¢ per 5 gal`}):</span>
              <span>{formatPenniesToDollars(billDetails.bill.excessUsageChargeInPennies)}</span>
            </div>
            {billDetails.bill.lateFees.map((fee, ind) => {
              return (
                <div
                  className={"flex flex-wrap items-start justify-between pt-[8px] pb-[8px] border-b border-tableBorder"}
                  key={`late_fee_container_${ind}`}
                >
                  <span>Late Fee:</span>
                  <span>{formatPenniesToDollars(fee.amountInPennies)}</span>
                </div>
              );
            })}
            <div className={"flex flex-wrap items-start justify-between pt-[8px] pb-[36px]"}>
              <span>Other Charges:</span>
              <span>${billDetails.bill.otherCharges.toFixed(2)}</span>
            </div>
            <div className={"flex flex-wrap items-start justify-between pt-[8px] pb-[8px] border-b border-tableBorder"}>
              <span>Account Balance before:</span>
              <span>{formatPenniesToDollars(billDetails.bill.accountBalanceBeforeInPennies)}</span>
            </div>
            <div className={"flex flex-wrap items-start justify-between pt-[8px] pb-[8px] border-b border-tableBorder"}>
              <span>New Charges this month:</span>
              <span>{formatPenniesToDollars(billDetails.bill.totalChargeAmountInPennies)}</span>
            </div>
            <div className={"flex flex-wrap items-start justify-between pt-[8px] pb-[8px]"}>
              <span>Account Balance after:</span>
              <span>{formatPenniesToDollars(billDetails.bill.accountBalanceAfterInPennies)}</span>
            </div>
            <div
              className={
                "flex flex-wrap items-start justify-between border-b-[2px] border-t-[2px] border-black font-bold pt-[12px] pb-[12px] mt-[8px]"
              }
            >
              <span>Total amount owing:</span>
              <span>{formatPenniesToDollars(billDetails.bill.amountOwingInPennies)}</span>
            </div>
          </div>
        </div>

        <div className={"w-full ml-[20px]"}>
          <h4 className={"text-[16px] mr-[15px] font-bold"}>Monthly Usages</h4>
          <table className={"w-full border-collapse text-[14px]"}>
            <thead>
              <tr>
                <th className={"p-[8px] text-left border border-tableBorder font-bold"}>Month</th>
                <th className={"p-[8px] text-right border border-tableBorder font-bold"}>Start</th>
                <th className={"p-[8px] text-right border border-tableBorder font-bold"}>End</th>
                <th className={"p-[8px] text-right border border-tableBorder font-bold"}>Usage</th>
                <th className={"p-[8px] text-right border border-tableBorder font-bold"}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {billDetails.previousUsages.map((monthlyUsage: any, index: number) => (
                <tr className={`${index % 2 === 0 ? "bg-[#fafafa]" : ""}`} key={`${monthlyUsage.month}_${index}`}>
                  <td className={"p-[8px] text-left border border-tableBorder"}>
                    {getMonthStrFromMonthIndex(monthlyUsage.month)}
                  </td>
                  <td className={"p-[8px] text-right border border-tableBorder"}>
                    {formatNumberWithCommas(monthlyUsage.gallonsStart)}
                  </td>
                  <td className={"p-[8px] text-right border border-tableBorder"}>
                    {formatNumberWithCommas(monthlyUsage.gallonsEnd)}
                  </td>
                  <td className={"p-[8px] text-right border border-tableBorder"}>
                    {formatNumberWithCommas(monthlyUsage.gallonsUsed)}
                  </td>
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
